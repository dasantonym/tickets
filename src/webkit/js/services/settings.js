angular.module('tickets.services.settings', [])
    .factory('App.Settings', function () {
        return {
            remote: {
                url: localStorage["remote.url"],
                login: localStorage["remote.login"],
                password: localStorage["remote.password"]
            },
            push: {
                url: localStorage["push.url"]
            },
            stats: {
                last_sync: localStorage["stats.last_sync"],
                last_push: localStorage["stats.last_push"]
            },
            storeRemote: function (url, login, password) {
                this.remote.url = url;
                this.remote.login = login;
                this.remote.password = password;
                localStorage["remote.url"] = this.remote.url;
                localStorage["remote.login"] = this.remote.login;
                localStorage["remote.password"] = this.remote.password;
            },
            storePush: function (url) {
                this.remote.url = url;
                localStorage["push.url"] = this.remote.url;
            }
        }
    });