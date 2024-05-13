import { LitElement, html, type TemplateResult } from 'lit'
import { property, customElement, state } from 'lit/decorators.js'
import { type HomeAssistant, type LovelaceCardEditor, fireEvent } from 'custom-card-helpers'
import { type CardConfig } from './types'
import { localize } from '../localize/localize';
import { defaultCardConfig, massaNodeCardEditor } from './consts';

@customElement(massaNodeCardEditor)
export class MassaNodeCardEditor extends LitElement implements LovelaceCardEditor {
  @property({ attribute: false })
  public hass?: HomeAssistant

  @state()
  private _config?: Partial<CardConfig>

  public setConfig (config?: Partial<CardConfig>): void {
    this._config = { ...defaultCardConfig, ...config };
  }

  protected render (): TemplateResult {
    if (this.hass == null) return html``
    return html`
      <div class="card-config">
        <div class="grid">
          <ha-formfield .label=${localize('editor.showWalletAmount', this.hass.language)}>
            <ha-switch
              .checked=${this._config?.show_wallet_amount}
              @change=${(ev: Event) => { this._updateConfig('show_wallet_amount', (ev.target as HTMLInputElement).checked) }}
            ></ha-switch
          ></ha-formfield>
        </div>
      </div>
    `
  }

  private _updateConfig (property: string, value: any) {
    if (this.hass == null) return
    this._config = { ...this._config, [property]: value }
    fireEvent(this, 'config-changed', { config: this._config })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [massaNodeCardEditor]: MassaNodeCardEditor
  }
}
