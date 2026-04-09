import { Game } from '../../game';
import { toast } from '../../../toast/toast';

export function processPacket_error(packet: Uint8Array, g: Game) {
  let idx = 1;

  let message = '';
  for (; packet[idx]; ++idx) {
    message += String.fromCharCode(packet[idx]);
  }

  toast.show(message, 'error');
  console.error(`ERROR: ${message}`);
}
