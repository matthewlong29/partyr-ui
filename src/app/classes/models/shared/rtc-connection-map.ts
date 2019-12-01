import { RTCConnectionContainer } from './rtc-connection-container';

export class RTCConnectionMap {
  private connContainers: { [remotePeerId: string]: RTCConnectionContainer } = {};
  getConnections() {
    return this.connContainers;
  }
  getConnContainer(remotePeerId: string) {
    return this.connContainers[remotePeerId];
  }
  addConnContainer(remotePeerId: string, connContainer: RTCConnectionContainer) {
    this.connContainers[remotePeerId] = connContainer;
  }
  getRemotePeerIds() {
    return Object.keys(this.connContainers);
  }
}
