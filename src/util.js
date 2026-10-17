import { WebLLM } from './providers/webllm.js';
import { Transformers } from './providers/transformers.js';

export class Util {

  static PROVIDERS = [WebLLM, Transformers];

  static get_provider(name) {

    for (const P of Util.PROVIDERS) {

      const provider = new P();

      if (provider.name == name) {
        return provider;
      }

    }

    return null;

  }

  static async detect_support() {

    const support = {};

    for (const P of Util.PROVIDERS) {

      const provider = new P();

      support[provider.name] = await provider.is_supported();

    }

    return support;

  }

  static async detect_capabilities() {

    const caps = {
      webgpu: false,
      shader_f16: false,
      adapter: null,
      wasm: typeof WebAssembly !== 'undefined',
      // multithreaded WASM + precise timers need COOP/COEP headers
      cross_origin_isolated: window.crossOriginIsolated === true,
      threads: navigator.hardwareConcurrency || 1
    };

    if (navigator.gpu) {

      const adapter = await navigator.gpu.requestAdapter();

      if (adapter) {

        caps.webgpu = true;
        caps.shader_f16 = adapter.features.has('shader-f16');
        caps.adapter = adapter.info;

      }

    }

    return caps;

  }

  static pick_best(trials, objective, minimize) {

    let best = null;

    for (const trial of trials) {

      if (!trial.metrics || typeof trial.metrics[objective] != 'number') {
        continue;
      }

      const value = trial.metrics[objective];

      if (!best
        || (minimize && value < best.metrics[objective])
        || (!minimize && value > best.metrics[objective])) {
        best = trial;
      }

    }

    return best;

  }

}
