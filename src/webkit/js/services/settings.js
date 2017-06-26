angular.module('tickets.services.settings', [])
    .factory('App.Settings', function () {
        return {
            remote: {
                url: localStorage["remote.url"],
                login: localStorage["remote.login"],
                password: localStorage["remote.password"],
                interval: localStorage["remote.interval"],
            },
            push: {
                url: localStorage["push.url"]
            },
            stats: {
                last_sync: localStorage["stats.last_sync"],
                last_push: localStorage["stats.last_push"]
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
            storePush: function (url) {
                this.remote.url = url;
                localStorage["push.url"] = this.remote.url;
            },
            storeBackup: function (backupInterval, autoBackupPath) {
                this.backup.backupInterval = backupInterval;
                this.backup.autoBackupPath = autoBackupPath;
                localStorage["backup.backupInterval"] = this.backup.backupInterval;
                localStorage["backup.autoBackupPath"] = this.backup.autoBackupPath;
            }
        }
    });