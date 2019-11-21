export class MediaStreamMap {
  private streams: { [remotePeerId: string]: MediaStream } = {};
  getStreams() {
    return this.streams;
  }
  getStream(remotePeerId: string) {
    return this.streams[remotePeerId];
  }
  addStream(remotePeerId: string, stream: MediaStream) {
    this.streams[remotePeerId] = stream;
  }
  getRemotePeerIds() {
    return Object.keys(this.streams);
  }
}
