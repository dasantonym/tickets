angular.module('tickets.services.stats', [])
    .factory('App.Stats', ['PubSub', function (PubSub) {
        return {
            stats: {
                last_sync: localStorage["stats.last_sync"] ? new Date(localStorage["stats.last_sync"]) : undefined,
                last_push: localStorage["stats.last_push"] ? new Date(localStorage["stats.last_push"]) : undefined,
                reachability: localStorage["stats.reachability"] || false,
                tickets: localStorage["stats.tickets"] || 0,
                tickets_valid: localStorage["stats.tickets_valid"] || 0,
                tickets_void: localStorage["stats.tickets_void"] || 0,
                pending: localStorage["stats.pending"] || 0
            },
            storeStats: function (last_sync, last_push, reachability, tickets, pending, tickets_valid, tickets_void) {
                var hasUpdate = false;

                if (last_sync instanceof Date && this.stats.last_sync !== last_sync) {
                    hasUpdate = true;
                    this.stats.last_sync = last_sync;
                    localStorage["stats.last_sync"] = this.stats.last_sync;
                }
                if (last_push instanceof Date && this.stats.last_push !== last_push) {
                    hasUpdate = true;
                    this.stats.last_push = last_push;
                    localStorage["stats.last_push"] = this.stats.last_push;
                }
                if (typeof reachability === 'boolean' && this.stats.reachability !== reachability) {
                    hasUpdate = true;
                    this.stats.reachability = reachability;
                    localStorage["stats.reachability"] = this.stats.reachability;
                }
                if (typeof tickets === 'number' && this.stats.tickets !== tickets) {
                    hasUpdate = true;
                    this.stats.tickets = tickets;
                    localStorage["stats.tickets"] = this.stats.tickets;
                }
                if (typeof pending === 'number' && this.stats.pending !== pending) {
                    hasUpdate = true;
                    this.stats.pending = pending;
                    localStorage["stats.pending"] = this.stats.pending;
                }
                if (typeof tickets_valid === 'number' && this.stats.tickets_valid !== tickets_valid) {
                    hasUpdate = true;
                    this.stats.tickets_valid = tickets_valid;
                    localStorage["stats.tickets_valid"] = this.stats.tickets_valid;
                }
                if (typeof tickets_void === 'number' && this.stats.tickets_void !== tickets_void) {
                    hasUpdate = true;
                    this.stats.tickets_void = tickets_void;
                    localStorage["stats.tickets_void"] = this.stats.tickets_void;
                }

                if (hasUpdate) {
                    PubSub.publish('stats-update');
                }
            }
        }
    }]);