const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update Available',
    message: `A new version (${info.version}) is available. It will be downloaded in the background.`,
  });
});

autoUpdater.on('update-not-available', () => {
  log.info('App is up to date.');
});

autoUpdater.on('download-progress', (progress) => {
  log.info(`Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  dialog
    .showMessageBox({
      type: 'question',
      title: 'Update Ready',
      message: 'Update downloaded. Restart the app to apply the update?',
      buttons: ['Restart', 'Later'],
    })
    .then((result) => {
      if (result.response === 0) autoUpdater.quitAndInstall();
    });
});

autoUpdater.on('error', (err) => {
  log.error('Auto-updater error:', err);
});

module.exports = autoUpdater;
