export class Search {

  /**
   * Expands {setting: [values]} into every combination.
   */
  static grid(space) {

    let configs = [{}];

    for (const setting in space) {

      const next = [];

      for (const config of configs) {
        for (const value of space[setting]) {
          next.push({...config, [setting]: value});
        }
      }

      configs = next;

    }

    return configs;

  }

  /**
   * Picks at most budget configs, uniformly at random, from the full grid.
   */
  static sample(space, budget) {

    const configs = Search.grid(space);

    if (configs.length <= budget) {
      return configs;
    }

    // Fisher-Yates, then take the first budget entries
    for (let i = configs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [configs[i], configs[j]] = [configs[j], configs[i]];
    }

    return configs.slice(0, budget);

  }

}
