import { LitElement, html, type TemplateResult, css } from 'lit'
import { type HomeAssistant } from 'custom-card-helpers'
import { customElement, property } from 'lit/decorators.js'
import { type HassConfigWithParams } from '../hass/dto/hass-config-with-params'
import { localize } from '../localize/localize'

interface MassaNodeData {
  status: string
  massa_price: string
  wallet_amount: string
  produced_block: string
  missed_block: string
  active_rolls: string
  total_amount: string
  wallet_amount_with_rolls: string
  total_gain_of_day: string
}

@customElement('massa-node-card')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MassaNodeCard extends LitElement {
  @property() public hass!: HomeAssistant
  @property() public config!: HassConfigWithParams
  massaNodeData: MassaNodeData = {
    status: 'Offline',
    massa_price: '0',
    wallet_amount: '0',
    produced_block: '0',
    missed_block: '0',
    active_rolls: '0',
    total_amount: '0',
    wallet_amount_with_rolls: '0',
    total_gain_of_day: '0'
  }
  error: boolean = false

  constructor () {
    super()
    // Interval for refetch data every minutes
    setInterval(() => {
      void this.updateComponents()
    }, 30 * 1000)
    // First refresh
    setTimeout(async () => { await this.updateComponents() }, 100)
  }

  async updateComponents (): Promise<void> {
    // Update data from sensors
    this.error = false
    const states = this.hass.states
    let data = {}
    Object.keys(this.massaNodeData).forEach((key) => {
      // If sensor is not defined
      if (!states[`sensor.massa_node_${key}`]) {
        this.error = true
        return
      }
      data = {
        ...data,
        [key]: states[`sensor.massa_node_${key}`].state
      }
    })
    if (!this.error) {
      this.massaNodeData = data as MassaNodeData
    }
    this.requestUpdate()
  }

  colorByValue (value: number) {
    // Positive/negative value coloring
    let color = ''
    let operator = ''
    if (value > 0) {
      color = 'green'
      operator = '+'
    } else if (value < 0) {
      color = 'red'
      operator = '-'
    }
    return html`
      <span style="${color ? 'color: ' + color : ''}">
        ${operator}${value}
      </span>
    `
  }

  render (): TemplateResult<1> {
    if (this.error) {
      return html`
      <ha-card header="Massa Node">
        <div class="card-content">
          ${localize('sensorNotFound', this.hass.language)}
        </div>
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
            ${this.colorByValue(parseInt(this.massaNodeData.produced_block) - parseInt(this.massaNodeData.missed_block))}
          </div>
          <!-- Wallet Gain -->
          <div class="row">
            <span>${localize('gainOfDay', this.hass.language)}</span>
            <span>${this.colorByValue(parseFloat(parseFloat(this.massaNodeData.total_gain_of_day).toFixed(2)))} MAS</span>
          </div>
          <!-- MASSA Current Price -->
          <div class="row">
            <span>${localize('currentPrice', this.hass.language)}</span>
            <span>${this.massaNodeData.massa_price} USDT</span>
          </div>
          <!-- Wallet Amount -->
          <div class="row" style="${!this.config.show_wallet_amount ? 'display: none' : ''}">
            <span>${localize('walletAmount', this.hass.language)}</span>
            <span>${parseFloat(this.massaNodeData.wallet_amount).toFixed(2)} MAS</span>
          </div>
          <!-- Total Amount -->
          <div class="row" style="${!this.config.show_wallet_amount ? 'display: none' : ''}">
            <span>${localize('totalAmount', this.hass.language)}</span>
            <span>${parseFloat(this.massaNodeData.total_amount).toFixed(2)} USDT</span>
          </div>
        </div>
      </ha-card>
    `
  }

  setConfig (config: HassConfigWithParams): void {
    this.config = config
  }

  getCardSize (): number {
    return 3
  }

  static readonly styles = css`
    .row {
      display: flex;
      height: 40px;
      margin: 0;
      justify-content: space-between;
    }
  `
}
