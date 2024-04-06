import { LitElement, html, type TemplateResult, css } from 'lit'
import { type HomeAssistant } from 'custom-card-helpers'
import { customElement, property } from 'lit/decorators.js'
import { getAddressesQuery } from '../api/queries/get-addresses-query'
import { type AddressesInfo } from '../api/dto/addresses-info'
import { type HassConfigWithParams } from '../hass/dto/hass-config-with-params'
import { getStatusQuery } from '../api/queries/get-status-query'
import { type StatusInfo } from '../api/dto/status-info'
import { localize } from '../localize/localize'

@customElement('massa-node-card')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MassaNodeCard extends LitElement {
  @property() public hass!: HomeAssistant
  @property() public config!: HassConfigWithParams
  private nodeResult: StatusInfo | undefined = undefined
  private addressResult: AddressesInfo | undefined = undefined

  constructor () {
    super()
    // Timeout for fetch data
    setTimeout(() => {
      void this.updateComponents()
    }, 500)

    // Interval for refetch data every minutes
    setInterval(() => {
      void this.updateComponents()
    }, 60 * 1000)
  }

  getParamsError (): string | undefined {
    let error: string | undefined
    if (this.config.ip === undefined) {
      error = 'noIp'
    } else if (this.config.port === undefined) {
      error = 'noPort'
    } else if (this.config.wallet_address === undefined) {
      error = 'noWallet'
    }
    return error
  }

  async updateComponents (): Promise<void> {
    if (this.getParamsError() !== undefined) {
      return
    }

    // Update data from node
    this.nodeResult = await getStatusQuery(this.config)
    this.addressResult = await getAddressesQuery(this.config)
    this.requestUpdate()
  }

  render (): TemplateResult<1> {
    const error = this.getParamsError()
    if (error !== undefined) {
      return html`
        <ha-card header="Massa Node">
          <div class="card-content">
            ${localize(`error.${error}`, this.hass.language)}
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
            <span style="color: ${this.nodeResult !== undefined ? 'green' : 'red'}">
              ${localize(this.nodeResult !== undefined ? 'online' : 'offline', this.hass.language)}
            </span>
          </div>
          <!-- Node Active rolls -->
          <div class="row">
            <span>${localize('activeRolls', this.hass.language)}</span>
            <span>${this.addressResult !== undefined ? this.addressResult.result[0].candidate_roll_count : 0}</span>
          </div>
          <!-- Node Block Produced -->
          <div class="row">
            <span>${localize('blockProduced', this.hass.language)}</span>
            <span>
              ${this.addressResult !== undefined
                ? this.addressResult.result[0].cycle_infos.reduce((result, data) => {
                    result += data.ok_count
                    return result
                  }, 0)
                : 0}</span>
          </div>
          <!-- Node Block Missed -->
          <div class="row">
            <span>${localize('blockFailed', this.hass.language)}</span>
            <spa>
              ${this.addressResult !== undefined
                ? this.addressResult.result[0].cycle_infos.reduce((result, data) => {
                    result += data.nok_count
                    return result
                  }, 0)
                : 0}</span>
          </div>
          <!-- Wallet Amount -->
          <div class="row">
            <span>${localize('walletAmount', this.hass.language)}</span>
            <span>${this.addressResult !== undefined ? this.addressResult.result[0].final_balance : 0}</span>
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
