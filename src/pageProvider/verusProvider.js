import { UserDeclinedError } from '@liquality/error-parser'
import { PageProvider } from './pageProvider'

const VERUS_REQUEST_MAP = {
  wallet_getConnectedNetwork: 'wallet.getConnectedNetwork',
  wallet_getAddresses: 'wallet.getAddresses',
  wallet_signMessage: 'wallet.signMessage',
  wallet_sendTransaction: 'wallet.sendTransaction'
}

class VerusPageProvider extends PageProvider {
  async handleRequest(req) {
    const vrsc = this.window.providerManager.getProviderFor('VRSC')
    if (req.method === 'wallet_sendTransaction') {
      const to = req.params[0].to
      const value = req.params[0].value.toString(16)
      return vrsc.getMethod('wallet.sendTransaction')({ to, value })
    }
    const method = VERUS_REQUEST_MAP[req.method] || req.method
    return vrsc.getMethod(method)(...req.params)
  }
  setup() {
    this.window.verus = {
      enable: async () => {
        const { accepted } = await this.window.providerManager.enable('verus')
        if (!accepted) throw new UserDeclinedError()

        const vrsc = this.window.providerManager.getProviderFor('VRSC')
        return vrsc.getMethod('wallet.getAddresses')()
      },
      request: async (req) => {
        const params = req.params || []
        return this.handleRequest({
          method: req.method,
          params
        })
      }
    }
  }
}

export { VerusPageProvider }
