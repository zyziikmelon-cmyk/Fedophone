// Fedophone AI noise suppression: RNNoise (Xiph/Mozilla, BSD licence) running in an AudioWorklet.
// The page compiles rnnoise.wasm and hands the module over; we process 10 ms frames at 48 kHz.
class RNN extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ok = false; this.inb = new Float32Array(480); this.ii = 0;
    this.q = new Float32Array(480 * 8); this.qh = 0; this.qt = 0; this.qn = 0;
    this.port.onmessage = async e => {
      try {
        const self = this;
        const inst = await WebAssembly.instantiate(e.data, { a: {
          a: n => { try { const m = self.x.c; m.grow(Math.ceil((n - m.buffer.byteLength) / 65536)); return 1; } catch (err) { return 0; } },
          b: (d, s, n) => { new Uint8Array(self.x.c.buffer).copyWithin(d, s, s + n); } } });
        this.x = inst.exports; this.x.d(); this.st = this.x.f(0); this.p = this.x.g(480 * 4); this.ok = true;
        this.port.postMessage('ready');
      } catch (err) { this.port.postMessage('fail'); }
    };
  }
  process(inputs, outputs) {
    const i = inputs[0] && inputs[0][0], o = outputs[0] && outputs[0][0];
    if (!o) return true;
    if (!i) { o.fill(0); return true; }
    if (!this.ok) { o.set(i); return true; }
    for (let k = 0; k < i.length; k++) {
      this.inb[this.ii++] = i[k];
      if (this.ii === 480) {
        this.ii = 0;
        const H = new Float32Array(this.x.c.buffer, this.p, 480);
        for (let j = 0; j < 480; j++) H[j] = this.inb[j] * 32768;
        this.x.j(this.st, this.p, this.p);
        const H2 = new Float32Array(this.x.c.buffer, this.p, 480);
        for (let j = 0; j < 480; j++) { if (this.qn < this.q.length) { this.q[this.qt] = H2[j] / 32768; this.qt = (this.qt + 1) % this.q.length; this.qn++; } }
      }
    }
    for (let k = 0; k < o.length; k++) {
      if (this.qn > 0) { o[k] = this.q[this.qh]; this.qh = (this.qh + 1) % this.q.length; this.qn--; } else o[k] = 0;
    }
    return true;
  }
}
registerProcessor('rnn', RNN);
