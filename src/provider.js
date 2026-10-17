/**
 * Base class for engine adapters.
 *
 * A provider never exposes inference to the user. It only lets the tuner
 * create the engine with a candidate config, benchmark it, and tear it
 * down again. The winning config is handed back via export().
 */
export class Provider {

  constructor() {

    this.name = 'generic';

  }

  async is_supported() {

    throw "Missing Implementation.";

  }

  /**
   * Returns the tunable settings as {setting: [values, ...]}.
   */
  get_space(capabilities) {

    throw "Missing Implementation.";

  }

  /**
   * Creates the engine with one candidate config.
   */
  async apply(model, config) {

    throw "Missing Implementation.";

  }

  /**
   * Runs the benchmark workload against the applied config.
   *
   * Returns metrics: {load_ms, ttft_ms, prefill_tps, decode_tps}
   */
  async measure(workload) {

    throw "Missing Implementation.";

  }

  /**
   * Frees the engine (GPU memory etc.) before the next trial.
   */
  async teardown() {

    throw "Missing Implementation.";

  }

  /**
   * Converts a tuned config into the engine's own option format.
   */
  export(config) {

    throw "Missing Implementation.";

  }

}
