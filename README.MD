# Massa node card

This repository contains the card for home assistant, it's used to view the status of your Massa node.
This card has English/French translation

![card.png](img/card.png)
## Install
To install the custom massa node card in the home assistant, you need to copy massa-node-card.js in the dist folder to the /config/www/ folder in the home assistant (you can use the file editor in the home assistant).

Then add this card to the resources path: https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources/

restart home assistant

To finish adding the custom card to your panel, select manual and type :
```yaml
type: custom:massa-node-card
ip: http://xx.xx.xx.xx
port: 33035
wallet_address: your_wallet_address
```

If you want to see your node status in remote, you need to expose your port (33035 by default) and then type your remote ip and port.
