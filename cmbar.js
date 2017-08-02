var CmBar = CmBar || {};
(function (app, win) {
	var itemName = 'cm-mp-user-data';

	var intervalId = 0;
	var intervalPeriod = 10000;
	function checkToken() {
		if (window.localStorage.getItem(itemName) === null && intervalId) {
			window.location.href = 'http://localhost/chefmod.memberportal.ui';
			clearInterval(intervalId);
		}
	}

	intervalId = setInterval(checkToken, intervalPeriod);
	//debugger
	//var xid = getQueryStringValue('xid');
	//if (xid == '') return;
	//getUserData(xid, function (r) {
	//	console.log(r);
	//})

	//app.oid = null;
	//app.uc = 0;
	//app.iuc = 0;
	//app.sessionId = '';
	//app.userFullName = '';
	//app.logId = 0;
	
	//get user data from local storage
	var itemName = 'cm-mp-user-data';
	var mp = JSON.parse(window.localStorage.getItem(itemName));
	app.oid = mp.oid || null;
	app.uc = mp.uc || 0;
	app.iuc = mp.iuc || 0;
	app.sessionId = mp.sessionId || '';
	app.userFullName = mp.userFullName || '';
	app.logId = mp.logId || 0;
  console.log('app=' + JSON.stringify(app));
  console.log('win=') + console.dir(win);

	//
  app.toggleAppListMenu = function() {
      console.log('toggleAppListMenu');
  }

	app.openAppInNewTab = function (e) {
		console.log('openAppInNewTab');
		var appName = e.currentTarget.getAttribute('data-app-name')
		getAppXferSession(function (r) {
			//console.log(r);
			var xappUrl = '';
			var xid = r;
			switch (appName) {
				case 'ordering':
					break;
				case 'list-management':
					break;
				case 'ezrecipe':
					xappUrl = 'http://localhost/ChefMod.RecipeManagement.UI/index.aspx?xid=' + xid;
					break;
				case 'analytics':
					xappUrl = 'http://localhost/ChefMod.Analytics.UI.WebClient-MemberPortal/default.html?xid=' + xid;
					break;
				case 'financials':
					xappUrl = 'http://localhost/ChefMod.Financials.UI-MemberPortal/default.html?xid=' + xid;
					break;
				case 'reports':
					//xappUrl = 'http://localhost/chefmod.memberportal.ui';
					//return window.open(xappUrl, '_blank', "height=700,width=1200");
					break;
				default:
					xappUrl = '';
			}

			//var xObj = {};
			//xObj.oid = mp.oid;
			//xObj.iuc = mp.iuc;
			//xObj.uc = mp.uc;
			//xObj.sessionId = mp.sessionId;
			//window.localStorage.setItem('cm-mp-xobj', JSON.stringify(value));

			var win = window.open(xappUrl, '_blank');

		})
	}

  app.goHome = function() {
    console.log('goHome');
    window.open('', 'ChefMod-MemberPortal-Home');
  }

	app.signOut = function () {
		doSignOut(function () {
			window.localStorage.removeItem(itemName);
			window.location.href = 'http://localhost/chefmod.memberportal.ui';
		})
	}


	function ajaxGetUserData(action, params, callback) {
		var json = {
			AppId:  '0968304A-5021-4AA9-8BAA-25758FBA5F23',	//'88A16020-BE57-4EE4-9FB7-5B028E4A2D1C',
			params: params
		};
		var d = { appid: appid, method: action, json: JSON.stringify(json) };
		//console.log(Date.now() + "||" + action + "||" + JSON.stringify(json.params));
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			url: 'http://localhost/ChefMod.Financials.UI.Services/HostPage.aspx/ExecAppMethod',
			data: JSON.stringify(d),
			success: function (response) {
				//console.log(Date.now() + "||" + action);
				callback(response);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				callback({ d: "{result:'error'}" });
			}
		});
		//parent.continueSession();
	};


	function ajaxServerInvoke(method, params, callback) {
		var ajaxUrl = 'http://localhost/ChefMod.MemberPortal.UI.Services/HostPage.aspx/ExecAppMethod';
		var json = {
			uc: app.uc,
			//AppId: "0768FB74-186A-4701-938A-861B60195B00",
			AppId: "F1F0A4DE-E965-4734-856B-6C19E187A850",
			SessionId: app.sessionId,
			params: params
		};
		var d = { method: method, json: JSON.stringify(json) }

		$.ajax({
			type: 'POST',
			url: ajaxUrl,
			dataType: 'json',
			data: JSON.stringify(d),
			contentType: "application/json",
			success: function (response) {
				callback(response);
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log(xhr);
				//callback(response.data);
			}
		})
	}

	function getUserData(xid, callback) {
		var params = {};
		params.id = xid;
		params.appId = '0968304A-5021-4AA9-8BAA-25758FBA5F23';	//'88A16020-BE57-4EE4-9FB7-5B028E4A2D1C';
		params.ip = '';						//'192.168.1.172';		//clientIP();
		params.domain = '';
		params.sessionSource = '';
		//loading(true);

		ajaxGetUserData('ChefMod.Financials.UI.Controllers.Security.GetUserData', params, function (response) {
			//loading(false);
			var r = eval('(' + response.d + ')');
			if (r.result == 'error') return;
			if (callback) callback(r);
		})
	}

	function getAppXferSession(callback) {
		var params = {};
		params.UserCode = app.uc;
		params.ImpersonatedUserCode = app.iuc;
		params.OrganizationId = app.oid;

		//loading(true);

		ajaxServerInvoke('ChefMod.MemberPortal.UI.Controllers.UserSecurity.CreateEAppXferSession', params, function (response) {
			//loading(false);
			if (response.d == '') {
				//error
				//windowResized();
				return;
			}
			var r = response.d;
			console.log(response);
			if (callback) callback(r);
		})
	}

	function doSignOut(callback) {
		//(.SessionId, .UserCode, .LogId)
		var params = {};
		params.SessionId = app.sessionId;
		params.UserCode = app.uc;
		params.LogId = app.logId;


		ajaxServerInvoke('ChefMod.MemberPortal.UI.Controllers.UserSecurity.Logout', params, function (response) {
			if (response.d == '') {
				if (callback) callback();
				return;	
			}
			return;
		})
	}

	function bake_cookie(name, value) {
		var cookie = [name, '=', JSON.stringify(value), '; domain=.', window.location.host.toString(), '; path=/;'].join('');
		document.cookie = cookie;
	}

	function read_cookie(name) {
		var result = document.cookie.match(new RegExp(name + '=([^;]+)'));
		result && (result = JSON.parse(result[1]));
		return window.localStorage.getItem(name);
	}

	function getQueryStringValue(key) {
		return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
	};

  $('#chefmod-bar-placeholder').load('http://localhost/ChefModBar/cmbar.html' + ' #chefmod-bar', function() {
		$('.txtUserFullName').text(app.userFullName);
  })
      //if (win.document!= null) {
      //	var x = win.document.createElement("P");                        // Create a <p> element
      //	var t = win.document.createTextNode("This is a paragraph.");    // Create a text node
      //	x.appendChild(t);                                           // Append the text to <p>
      //	win.document.body.appendChild(x);
      //	debugger
      //}





})(CmBar, window);