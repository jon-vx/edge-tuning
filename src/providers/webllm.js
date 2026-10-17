import {Provider} from '../provider.js';

export class WebLLM extends Provider {

  constructor() {

    super();

    this.name = 'webllm';

  }

  async is_supported() {

    if (!navigator.gpu) {
      return false;
    }

    const adapter = await navigator.gpu.requestAdapter();

    return adapter !== null;

  }

  get_space(capabilities) {

    // prefill_chunk_size is baked into the compiled model, so it is not
    // tunable here, only options WebLLM reads at load time are
    return {
      context_window_size: [1024, 2048, 4096]
    };

  }

  export(config) {

    // passed as chatOpts to webllm.CreateMLCEngine(model, engineConfig, chatOpts)
    return {
      context_window_size: config.context_window_size
    };

  }

}
