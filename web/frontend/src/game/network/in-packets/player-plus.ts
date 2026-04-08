import { Game } from "../../game";

export function processPacket_playerPlus(packet: Uint8Array, g: Game) {
  const id = packet[1] << 24 | packet[2] << 16 | packet[3] << 8 | packet[4];

  let name = '';
  for (let idx = 5; idx < packet.length; ++idx) {
    name += String.fromCharCode(packet[idx]);
  }

  g.addPlayer(id, name);
  if (id === (window as any).myUser?.id) {
    const player = g.players.get(id);
    if (player) {
      g.myPlayer = player;
    }
  }
}