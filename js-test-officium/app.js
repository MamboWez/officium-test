var clientId = "343eb415-883a-4a75-a611-0b24033e19ff";
var tenant = "wvzrubicon.onmicrosoft.com";

var URI_FUNCTION = "https://func-wvz-officium.azurewebsites.net/api/salutatio";

function popUpLoginCallback(errorDescription, token, error) {
  window.location.href = "http://localhost:8000";
}

$(document).ready(function () {
  if (clientId.length !== 36 || tenant.length < 1) {   
    showModal("Alert", "Please set proper clientId and tenant in js sources.");
  }

  var openAuthInPopup = false;
  var config = {
    clientId: clientId,
    tenant: tenant,
    popUp: openAuthInPopup,
    callback: openAuthInPopup ? popUpLoginCallback : undefined,
  };

  var ac = new AuthenticationContext(config);

  if (!openAuthInPopup) {
    handleAADCallback(ac); // If auth was opened in the same window - process the callback (will extract token from url hash part, AFAIK)
  }

  var user = ac.getCachedUser();
  var token = ac.getCachedToken(clientId);

  setControlsState(isLoggedIn(user, token));

  $("#login").click(function () {
    if (!isLoggedIn(user, token)) {
      ac.login();
    }
  });

  $("#logout").click(function () {
    ac.logOut();
  });

  $("#btn-request-function-salutatio").click(function () {
    if (!isLoggedIn(user, token)) {      
      showModal("Alert", "Not authorized");

      return;
    }

    $.ajax({
      method: "POST",
      url: URI_FUNCTION,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },      
      success: function (data) {
        //console.log(JSON.stringify(data, null, 4));

        $("#results").text(JSON.stringify(data, null, 4));
      },
      error: function (data) {        
        showModal('Whoops, something went wrong.', JSON.stringify(data, null, 4));        

        $("#results").text(JSON.stringify(data, null, 4));
      },
    });
  });

});

function showModal(titleText, bodyText) {
  $('#modalLong .modal-title').text(titleText);
  $('#modalLong .modal-body').text(bodyText);
  $('#modalLong').modal('show');

  console.info(bodyText);
}

function handleAADCallback(ac) {
  ac.handleWindowCallback();
}

function setControlsState(isLoggedIn) {
  if (!isLoggedIn) {
    $("#btn-request-function-salutatio").prop("disabled", "true");

    $("#logout").prop("disabled", "true").hide();
    $("#login").removeProp("disabled").show();
  } else {
    $("#btn-request-function-salutatio").removeProp("disabled");

    $("#logout").removeProp("disabled").show();
    $("#login").prop("disabled", "true").hide();
  }
}

function isLoggedIn(user, token) {
  return user !== null && token !== null;
}