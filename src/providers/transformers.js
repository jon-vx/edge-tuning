import {Provider} from '../provider.js';

export class Transformers extends Provider {

  constructor() {

    super();

    this.name = 'transformers';

  }

  async is_supported() {

    // transformers.js falls back to WASM when WebGPU is missing
    return typeof WebAssembly !== 'undefined';

  }

  get_space(capabilities) {

    const space = {
      device: capabilities.webgpu ? ['webgpu', 'wasm'] : ['wasm'],
      dtype: ['fp32', 'q8', 'q4']
    };

    if (capabilities.shader_f16) {
      space.dtype.push('fp16');
    }

    // more than one WASM thread needs cross-origin isolation
    if (capabilities.cross_origin_isolated && capabilities.threads > 1) {
      space.num_threads = [1, capabilities.threads];
    }

    return space;

  }

  export(config) {

    return {
      // passed to pipeline(task, model, pipeline_options)
      pipeline_options: {
        device: config.device,
        dtype: config.dtype
      },
      // set on env.backends.onnx.wasm before creating the pipeline
      wasm: {
        numThreads: config.num_threads || 1
      }
    };

  }

}
