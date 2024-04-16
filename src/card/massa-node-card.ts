import { LitElement, html, type TemplateResult, css } from 'lit'
import { type HomeAssistant } from 'custom-card-helpers'
import { customElement, property } from 'lit/decorators.js'
import { getAddressesQuery } from '../api/node/queries/get-addresses-query'
import { type AddressesInfo } from '../api/node/dto/addresses-info'
import { type HassConfigWithParams } from '../hass/dto/hass-config-with-params'
import { getStatusQuery } from '../api/node/queries/get-status-query'
import { type StatusInfo } from '../api/node/dto/status-info'
import { localize } from '../localize/localize'
import { getPriceQuery } from '../api/bitget/queries/get-price-query'
import { type PriceInfo } from '../api/bitget/dto/price-info'

@customElement('massa-node-card')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class MassaNodeCard extends LitElement {
  @property() public hass!: HomeAssistant
  @property() public config!: HassConfigWithParams
  private nodeResult: StatusInfo | undefined = undefined
  private addressResult: AddressesInfo | undefined = undefined
  private price: PriceInfo | undefined = undefined

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
    this.price = await getPriceQuery()
    this.requestUpdate()
  }

  calculatePrice (): number {
    if (this.addressResult === undefined || this.price === undefined) {
      return 0
    }
    const rolls = this.addressResult.result[0].final_roll_count
    const wallet = Number.parseFloat(this.addressResult.result[0].final_balance)
    if (this.price.lastPr === undefined || rolls === undefined || wallet === undefined) {
      return 0
    }
    const fixedResult = ((wallet + rolls * 100) * Number.parseFloat(this.price.lastPr)).toFixed(2) ?? 0
    return parseFloat(fixedResult)
  }

  render (): TemplateResult<1> {
    const error = this.getParamsError()
    if (error !== undefined) {
      return html`
        <ha-card header="Massa Node">
          <div class="card-content">${localize(`error.${error}`, this.hass.language)}</div>
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
              ${
                this.addressResult !== undefined
                  ? this.addressResult.result[0].cycle_infos.reduce((result, data) => {
                      result += data.ok_count
                      return result
                    }, 0)
                  : 0
              }</span>
          </div>
          <!-- Node Block Missed -->
          <div class="row">
            <span>${localize('blockFailed', this.hass.language)}</span>
            <spa>
              ${
                this.addressResult !== undefined
                  ? this.addressResult.result[0].cycle_infos.reduce((result, data) => {
                      result += data.nok_count
                      return result
                    }, 0)
                  : 0
              }</span>
          </div>
          <!-- Wallet Amount -->
          <div class="row">
            <span>${localize('walletAmount', this.hass.language)}</span>
            <span>${this.addressResult !== undefined ? this.addressResult.result[0].final_balance : 0} MAS</span>
          </div>
          <!-- Current Price -->
          <div class="row">
            <span>${localize('currentPrice', this.hass.language)}</span>
            <span>${this.price !== undefined ? this.price.lastPr : 0} USDT</span>
          </div>
          <!-- Total Amount -->
          <div class="row">
            <span>${localize('totalAmount', this.hass.language)}</span>
            <span>${this.calculatePrice()} USDT</span>
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
