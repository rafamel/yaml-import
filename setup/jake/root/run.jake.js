desc('Runs commands');
task('run', { async: true }, (...cmds) => {
  jake.exec(cmds, { interactive: true });
});
