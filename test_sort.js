const classes = [{name: '10A1'}, {name: '1A'}, {name: '2B'}, {name: '12A2'}, {name: '10C'}];

const sortClasses = (classes) => {
  return [...classes].sort((a, b) => {
    const parse = (name) => {
      const match = name.match(/^(\d+)(.*)$/);
      if (match) {
        return { num: parseInt(match[1], 10), str: match[2] };
      }
      return { num: 0, str: name };
    };
    const pA = parse(a.name);
    const pB = parse(b.name);
    if (pA.num !== pB.num) return pA.num - pB.num;
    return pA.str.localeCompare(pB.str);
  });
};

console.log(sortClasses(classes));
