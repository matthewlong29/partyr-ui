export class RTCConnectionMap {
  private connections: { [remotePeerId: string]: RTCPeerConnection } = {};
  getConnections() {
    return this.connections;
  }
  getConnection(remotePeerId: string) {
    return this.connections[remotePeerId];
  }
  addConnection(remotePeerId: string, connection: RTCPeerConnection) {
    this.connections[remotePeerId] = connection;
  }
  getRemotePeerIds() {
    return Object.keys(this.connections);
  }
}
