(function() {
	window.Main = {
		Models: {},
		init: function() {
			var self = this;
			_.templateSettings = {
				interpolate : /\{\{(.+?)\}\}/g
			};
			self.doneLoading = false;
			self.offset = 0;
			self.albumTrackKeys = {}; // Maps album id with associated Track keys
			self.template = _.template($("#album-template").text().trim()) // use {{}} as the delimiter in templates
			R.ready(function() {
				// R.player.play({source: "a3032151"}); // Alice In Chains - The Devil Put Dinosaurs Here
				if (R.authenticated()) {
					self.loadCollection();
				} else {
					R.authenticate();
				}
			});
		},

		// This function will incrementally fetch and display 10 albums 
		// from the users collection until the entire catalog is loaded
		loadCollection: function() {
			var self = this;
			R.request({
				method: "getAlbumsInCollection",
				content: {
					user: R.currentUser.get("key"),
					start: self.offset,
					count: 10,
					sort: 'name'
				},
				complete: function(response) {
					//Since we are requesting exactly 10 albums, if we get any less than 10,
					//then it means we are at the end of the collection
					if (response.result.length < 10) {
						self.doneLoading = true;	
					}
					for (var i=0; i < response.result.length; i++) {
						var html = self.template(response.result[i]);
						var $img = $("<img />", {
							"src": response.result[i].icon, 
							"id": response.result[i].albumKey, 
							"title": response.result[i].artist + " - " + response.result[i].name
						});
						//Convert to jquery object in order to attach an onclick event handler
						var $html = $($.parseHTML(html)); 
						$html.on("click", self.deleteAlbum);
						self.albumTrackKeys[response.result[i].albumKey] = response.result[i].trackKeys;
						
						$("#collection").append($html);
						self.offset += 1;
					}
					if (self.doneLoading === false) {
						//recursively download albums until we are done
						self.loadCollection();
					} 
				}
			});
		}, 

		deleteAlbum: function() {
			var self = this;
			var albumKey = $(this).find('img').attr('id');
			R.request({
				method: "removeFromCollection",
				content: {
					keys: Main.albumTrackKeys[albumKey]
				}, 
				complete: function(response) {
					if (response.result === true) {
						//Gray out the album cover if the deletion worked
						$(self).find('img').css('opacity', 0.3);
					}
				}
			});
		}
	};
	
	$(document).ready(function() {
		Main.init();
	});
})();
