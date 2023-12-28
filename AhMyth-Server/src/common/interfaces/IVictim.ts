// var Victim = function(socket, ip, port, country, manf, model, release) {
//     this.socket = socket;
//     this.ip = ip;
//     this.port = port;
//     this.country = country;
//     this.manf = manf;
//     this.model = model;
//     this.release = release;
// };

import { type VictimStatus } from '../enums';

export interface IVictim {
    deviceId: string;
    ip: string;
    port: number;
    country: string;
    manf: string;
    model: string;
    release: string;
    status: VictimStatus;
}
