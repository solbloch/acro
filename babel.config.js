const presets = [
  [
    "@babel/preset-env",
    {
      targets: "last 2 Chrome versions",
    },
  ],
  "@babel/preset-react",
];
const plugins = [];

module.exports = { presets, plugins };
