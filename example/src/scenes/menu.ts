import * as ex from 'excalibur'
import { html, UIComponent, UISystem } from 'excalibur-uhtml'

export class MenuScene extends ex.Scene {
  constructor() {
    super()

    this.world.systemManager.addSystem(UISystem)
  }

  onInitialize(): void {
    this.add(new Menu())
  }
}

class Menu extends ex.ScreenElement {
  handler = () => {
    console.log('asdf')
  }

  ui = new UIComponent(
    () => html`
      <h1>Examples</h1>

      <div id="menu">
        ${Button({
          label: 'Physics',
          onClick: () => this.scene!.engine.goToScene('physics'),
        })}
      </div>

      <div
        style="display: flex; margin-top: 40px; justify-content: space-between;"
      >
        <ex-entity
          class="box"
          .this=${[
            ex.Actor,
            {
              anchor: ex.vec(0, 0),
              width: 100,
              height: 100,
              color: ex.Color.Green,
            },
          ]}
          @pointermove=${this.handler}
        />
      </div>

      <style>
        .box {
          pointer-events: auto;
          border: 2px solid red;
          width: 100px;
          height: 100px;
          transition: transform 0.3s ease-in-out;
          transform: translate(0px, 0px);
          cursor: pointer;
        }

        .box:hover {
          transform: translate(0px, -10px);
        }

        button {
          pointer-events: auto;
          height: 28px;
        }
      </style>
    `,
    {
      scoped: true,
    },
  )

  onInitialize(engine: ex.Engine<any>): void {
    this.addComponent(this.ui)
  }
}

const Button = (props: { label: string; onClick: () => void }) => html`
  <button @click=${props.onClick}>${props.label}</button>
`
