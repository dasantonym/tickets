angular.module('tickets.services.settings', [])
    .factory('App.Settings', function () {
        return {
            remote: {
                url: localStorage["remote.url"],
                login: localStorage["remote.login"],
                password: localStorage["remote.password"],
                interval: localStorage["remote.interval"],
                latest_update: localStorage["remote.latestUpdate"]
            },
            push: {
                url: localStorage["push.url"],
                backoff: localStorage["push.backoff"] || 0
            },
            backup: {
                backupInterval: localStorage["backup.backupInterval"],
                autoBackupPath: localStorage["backup.autoBackupPath"]
            },
            storeRemote: function (url, login, password, interval) {
                this.remote.url = url;
                this.remote.login = login;
                this.remote.password = password;
                this.remote.interval = interval;
                localStorage["remote.url"] = this.remote.url;
                localStorage["remote.login"] = this.remote.login;
                localStorage["remote.password"] = this.remote.password;
                localStorage["remote.interval"] = this.remote.interval;
            },
            storeRemoteUpdate: function (latest_update) {
                this.remote.latest_update = latest_update;
                localStorage["remote.latestUpdate"] = this.remote.latest_update;
            },
            storePush: function (url, backoff) {
                this.push.url = url;
                this.push.backoff = backoff;
                localStorage["push.url"] = this.push.url;
                localStorage["push.backoff"] = this.push.backoff;
            },
            storeBackup: function (backupInterval, autoBackupPath) {
                this.backup.backupInterval = backupInterval;
                this.backup.autoBackupPath = autoBackupPath;
                localStorage["backup.backupInterval"] = this.backup.backupInterval;
                localStorage["backup.autoBackupPath"] = this.backup.autoBackupPath;
            }
        }
    });