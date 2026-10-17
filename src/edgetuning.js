import {Util} from './util.js';
import {Search} from './search.js';

// metrics where smaller is better, everything else is maximized
const MINIMIZE = ['load_ms', 'ttft_ms'];

export class EdgeTuning {

  constructor() {
    this.provider = null;
    this.capabilities = null;
  }

  /**
   * Reports what this browser can do and which providers could run here.
   *
   * Does not pick a provider, that is up to the user.
   */
  async detect() {

    this.capabilities = await Util.detect_capabilities();

    return {
      capabilities: this.capabilities,
      providers: await Util.detect_support()
    };

  }

  /**
   * Initializes EdgeTuning with the provider the user asked for.
   *
   * Throws if the name is missing, unknown, or not supported in this
   * browser. There is no automatic fallback.
   */
  async init(name) {

    const names = Util.PROVIDERS.map(P => new P().name);

    if (typeof name == 'undefined') {
      throw "Provider Name Required. Available: " + names.join(', ');
    }

    const provider = Util.get_provider(name);

    if (!provider) {
      throw "Unknown Provider: " + name + ". Available: " + names.join(', ');
    }

    if (!(await provider.is_supported())) {
      throw "Provider Not Supported In This Browser: " + name;
    }

    this.capabilities = await Util.detect_capabilities();
    this.provider = provider;

    console.log('Using', this.provider.name, '!');

  }

  /**
   * Benchmarks candidate configs for the current provider and returns
   * the best one, along with every trial that was run.
   */
  async tune(options) {

    if (!this.provider) {
      throw "Call init() first.";
    }

    const model = options.model;
    const workload = options.workload || {prompt_tokens: 512, gen_tokens: 128};
    const objective = options.objective || 'decode_tps';
    const budget = options.budget || 20;

    const space = this.provider.get_space(this.capabilities);
    const configs = Search.sample(space, budget);

    const trials = [];

    for (const config of configs) {

      const trial = {config: config, metrics: null, error: null};

      try {

        await this.provider.apply(model, config);
        trial.metrics = await this.provider.measure(workload);

      } catch (e) {

        // e.g. out of GPU memory, keep going with the next config
        trial.error = String(e);

      } finally {

        try {
          await this.provider.teardown();
        } catch (e) {
          console.warn('teardown failed', e);
        }

      }

      console.log('trial', trials.length + 1, '/', configs.length, trial);

      trials.push(trial);

    }

    const best = Util.pick_best(trials, objective, MINIMIZE.includes(objective));

    if (!best) {
      throw "All Trials Failed.";
    }

    return {
      provider: this.provider.name,
      model: model,
      objective: objective,
      best: best.config,
      metrics: best.metrics,
      exported: this.provider.export(best.config),
      trials: trials
    };

  }

}
