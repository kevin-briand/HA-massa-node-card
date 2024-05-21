import { LitElement, html, type TemplateResult, css } from 'lit'
import { type HomeAssistant } from 'custom-card-helpers'
import { customElement, property } from 'lit/decorators.js'
import { localize } from '../localize/localize'
import { type Dialog } from '@material/mwc-dialog'
import { type EntityData, type HassConfigWithParams, type MassaNodeData } from './types'
import './massa-node-card-editor'
import { defaultMassaNodeData, entityPrefix, massaNodeCard, massaNodeCardEditor } from './consts'
import { MassaNodeCardEditor } from './massa-node-card-editor';

@customElement(massaNodeCard)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MassaNodeCard extends LitElement {
  @property() public hass!: HomeAssistant
  @property() public config!: HassConfigWithParams
  massaNodeData: MassaNodeData = defaultMassaNodeData

  error: boolean = false
  DailyEarningsHistory: Record<string, string> = {}

  async firstUpdated (): Promise<void> {
    // Interval for refetch data every minutes
    setInterval(() => {
      void this.updateComponents()
    }, 60 * 1000)
    await this.updateComponents()

    // Add click event listener to the Daily Earning
    const element = this.shadowRoot?.querySelector('#dailyEarning')
    if (element == null) {
      return
    }
    element.addEventListener('click', () => {
      const dialog: Dialog | null = this.shadowRoot?.querySelector('#historyDailyEarningDialog') ?? null
      if (dialog == null) {
        return
      }
      dialog.open = true
    })
  }

  async updateComponents (): Promise<void> {
    // Update data from sensors
    this.error = false
    const states = this.hass.states
    let data = {}
    Object.keys(this.massaNodeData).forEach((key) => {
      // If sensor is not defined
      if (states[entityPrefix + key] === undefined) {
        this.error = true
        return
      }
      data = {
        ...data,
        [key]: states[entityPrefix + key].state
      }
    })
    if (!this.error) {
      this.massaNodeData = data as MassaNodeData
    }

    await this.getGainOfDayHistory()

    this.requestUpdate()
  }

  private async getGainOfDayHistory (): Promise<void> {
    try {
      // Get 7 days history for total_gain_of_day sensor
      const currentDate = new Date()
      currentDate.setHours(0, 0, 0)
      const startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      const endDate = new Date(currentDate.getTime() - 60 * 1000)
      const result = await this.hass.callApi<EntityData[][]>(
        'GET',
        `history/period/${startDate.toISOString()}?filter_entity_id=sensor.massa_node_total_gain_of_day&end_time=${endDate.toISOString()}`
      )
      let lastDate = ''
      let maxValue = 10
      this.DailyEarningsHistory = result[0].reduce((r: Record<string, string>, d) => {
        const dataDate = new Date(d.last_updated).toLocaleDateString()
        if (r[dataDate] !== undefined && d.state === '0') {
          lastDate = dataDate
        }
        if (lastDate !== dataDate && (r[dataDate] === undefined || d.state !== '0')) {
          let value = parseFloat(d.state)
          // while state is negative, add 100 to the value
          while (value < 0) {
            value += 100
          }
          r[dataDate] = value.toString()
          if (maxValue < value) {
            maxValue = value
          }
        }
        return r
      }, {})
    } catch (e) {
      console.log(e)
    }
  }

  private calculateAverageGainOfDay (): number {
    const keys = Object.keys(this.DailyEarningsHistory)
    const nbOfDays = keys.length
    if (nbOfDays === 0) {
      return 0
    }
    const sum = keys.reduce((sum: number, key) => {
      return sum + parseFloat(this.DailyEarningsHistory[key])
    }, 0)
    return sum / nbOfDays
  }

  private colorByValue (value: number): TemplateResult<1> {
    // Positive/negative value coloring
    let color = ''
    let operator = ''
    if (value > 0) {
      color = 'green'
      operator = '+'
    } else if (value < 0) {
      color = 'red'
    }
    return html` <span style="${color !== '' ? 'color: ' + color : ''}"> ${operator}${value} </span> `
  }

  render (): TemplateResult<1> {
    if (this.error) {
      return html`
        <ha-card header="Massa Node">
          <div class="card-content">${localize('sensorNotFound', this.hass.language)}</div>
        </ha-card>
      `
    }
    return html`
      <ha-card header="Massa Node">
        <div class="card-content">
          <!-- Node Status -->
          <div class="row">
            <span>${localize('status', this.hass.language)}</span>
            <span style="color: ${this.massaNodeData.status !== 'Offline' ? 'green' : 'red'}">
              ${localize(this.massaNodeData.status.toLowerCase(), this.hass.language)}
            </span>
          </div>
          <!-- Node Active rolls -->
          <div class="row">
            <span>${localize('activeRolls', this.hass.language)}</span>
            <span>${this.massaNodeData.active_rolls}</span>
          </div>
          <!-- Node Block Produced/Missed -->
          <div class="row">
            <span>${localize('blockProducedMissed', this.hass.language)}</span>
            ${this.colorByValue(
              parseInt(this.massaNodeData.produced_block) - parseInt(this.massaNodeData.missed_block)
            )}
          </div>
          <!-- Wallet Gain -->
          <div class="row" id="dailyEarning">
            <span>${localize('dailyEarning', this.hass.language)}</span>
            <span
              >${this.colorByValue(parseFloat(parseFloat(this.massaNodeData.total_gain_of_day).toFixed(2)))} MAS</span
            >
          </div>
          <!-- MASSA Current Price -->
          <div class="row">
            <span>${localize('currentPrice', this.hass.language)}</span>
            <span>${this.massaNodeData.massa_price} USDT</span>
          </div>
          <!-- Wallet Amount -->
          <div class="row" style="${!this.config.show_wallet_amount ? 'display: none' : ''}">
            <span>${localize('walletAmount', this.hass.language)}</span>
            <span>
              ${parseFloat(this.massaNodeData.wallet_amount).toFixed(2)}
                (${parseFloat(this.massaNodeData.wallet_amount_with_rolls).toFixed(2)}) MAS
            </span>
          </div>
          <!-- Total Amount -->
          <div class="row" style="${!this.config.show_wallet_amount ? 'display: none' : ''}">
            <span>${localize('totalAmount', this.hass.language)}</span>
            <span>${parseFloat(this.massaNodeData.total_amount).toFixed(2)} USDT</span>
          </div>
        </div>
      </ha-card>
      <!-- Daily earning history dialog -->
      <ha-dialog id="historyDailyEarningDialog" hideactions="" flexcontent="">
        <ha-dialog-header>
          <ha-icon-button slot="navigationIcon" dialogaction="cancel">
            <ha-icon icon="mdi:close"></ha-icon>
          </ha-icon-button>
          <span slot="title">${localize('dailyEarningHistory', this.hass.language)}</span>
        </ha-dialog-header>
        <div style="display: flex; flex-direction: column;">
          ${Object.keys(this.DailyEarningsHistory).map((key) => {
            return html`
              <div class="dialogRow">
                <span>${key}</span>
                <span>${parseFloat(this.DailyEarningsHistory[key]).toFixed(2)} MAS</span>
              </div>
            `
          })}
          <div class="dialogRow">
            <span>${localize('average', this.hass.language)}</span>
            <span>${this.calculateAverageGainOfDay().toFixed(2)} MAS</span>
          </div>
        </div>
      </ha-dialog>
    `
  }

  public static async getConfigElement (): Promise<MassaNodeCardEditor> {
    await import('./massa-node-card-editor')
    return document.createElement(massaNodeCardEditor)
  }

  setConfig (config: HassConfigWithParams): void {
    this.config = config
    this.requestUpdate()
  }

  static readonly styles = css`
    .row {
      display: flex;
      height: 40px;
      margin: 0;
      justify-content: space-between;
    }
    
    #dailyEarning {
      cursor: pointer;
    }
    
    .row span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .row span:nth-of-type(2) {
      flex-grow: 1;
      overflow: visible;
      text-align: right;
   }
    
    .dialogRow {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    ha-icon {
      display: flex;
      align-content: center;
    }
  `
}

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: massaNodeCard,
  name: 'Massa Node Card',
  description: 'Card to follow your massa node.',
  preview: true
})
