//client side login functions
var login = true;


function setFormMessage(formElement, type, message) {
    //take in loginForm or createAccountForm
    //take in success or error
    //take in message

    //reference message element from given form
    //constant?
    const messageElement = formElement.querySelector(".form__message");

    messageElement.textContent = message;
    messageElement.classList.remove("form__message--success", "form__message--error");
    messageElement.classList.add(`form__message--${type}`);
}


function setInputError(inputElement, message) {
    inputElement.classList.add("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent= message;
}

function clearInputError(inputElement){
    inputElement.classList.remove("form__input--error");
    inputElement.parentElement.querySelector(".form__input-error-message").textContent= "";
}


document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#login");
    const createAccountForm = document.querySelector("#createAccount");

    //toggle between login and create account forms
    document.querySelector("#linkCreateAccount").addEventListener("click", e => {
        login = false;
        console.log('createAcc switch ' + login);
        //don't go to default href (reference event)
        e.preventDefault(); 
        loginForm.classList.add("form--hidden");
        createAccountForm.classList.remove("form--hidden");
    });

    document.querySelector("#linkLogin").addEventListener("click", e => { 
        //clearInputError("#LinkLogin");
        login = true;
        console.log('login switch ' + login);
        e.preventDefault();
        loginForm.classList.remove("form--hidden");
        createAccountForm.classList.add("form--hidden");
    });
    
    
    loginForm.addEventListener("submit", e => {
        //grab submit event
        e.preventDefault(); //prevent refresh if using ajax
        console.log('in submit, login is t/f: ' + login);  
        //Perform login with database
            console.log('inside login, login is t/f: ' + login);
            var username = $("#loginUsername").val();
            var password = $("#loginPassword").val();
            var loginJsonString = {username: username, password: password}; 
            console.log('username and password: ' + username + ' ' + password);
            $.ajax({
                //i am confused about the difference btween the call at html level
                // and the call here
                //im calling auth twice ?
                url: 'http://localhost:5000' + "/auth",
                type:"post",
                data: loginJsonString,               
                success: function(response){
                    if(response=='success'){
                        console.log('response success');
                        setFormMessage(loginForm, "success", "Success");
                        window.location.assign('/mapscreen');
                    }
                    else if(response=='invalid'){
                        setInputError(loginForm, "Invalid username/password combination");
                    }

                    else if(response=='userExists'){
                        setInputError(loginForm, "Username already exists");
                    }
                
                    
                    //var data = JSON.parse(response);
                    //if(data.msg==SUCCESS){
                //}
                    //else{
                        //console.log('error' + data.msg);
                    //}
                    //if successsetInputError(loginForm, "Invalid username/password combination");
                    /*console.log('in error trap');
                    alert('Error ' + err);*/
                    //if success then logged in
                    //else give error
                    
                    //alert(response);                   
                },
                error: function(error){
                    alert('Error ' + error);
                    //throw error;
                }
            });           
    });
    createAccountForm.addEventListener("submit", e => {
        e.preventDefault(); 
        console.log('in account reg, login is t/f: ' + login);            
        //have to validate that acc doesnt already exist in services
        //output result to user locally
        var newUsername = $("#newUsername").val();
        var newPassword = $("#newPassword").val();
        var newEmail = $("#newEmail").val();
        console.log('username password email: ' + newUsername + ' ' + newPassword + ' ' + newEmail);
        var createAccountJsonString = {newUsername: newUsername, newPassword: newPassword, newEmail:newEmail}; 
        $.ajax({
            url: 'http://localhost:5000' + "/createAccount",
            type:"post",
            data: createAccountJsonString,
            success: function(response){
                if(response=='SUCCESS'){
                    setFormMessage(createAccountForm, "success", "Success");           
                    //after a few secs change to login, so user can log in
                    //end functionality:automatically redirect to map page, user logged in from createacc
                    //setTimeout(() => {loginForm.classList.remove("form--hidden"); createAccountForm.classList.add("form--hidden");}, 1.0*1000); 
                    window.location.assign('/mapscreen');
                    //loginForm.classList.remove("form--hidden");
                }
                else if (response=='userExists'){
                    setInputError(createAccountForm, "Username already exists");
                    console.log('user already exists');
                }

                else if (response=='invalid'){
                        console.log('generic error');
                }

                else{
                        console.log('else');
                }    
            },
            error: function(err){
                console.log('in createAcc error trap');
                setInputError(createAccountForm, "Failed to create account");
                alert('Create Account Error ' + err);
            }
        });
            console.log("end of createAccount submit listener");
        
    });


        
    document.querySelectorAll(".form__input").forEach(inputElement => {
        inputElement.addEventListener("blur", e => {
            if (e.target.id === "loginUsername"  && e.target.value.length == 0) {
                setInputError(inputElement, "Please enter a username.");
            } 
            if(e.targetid === "loginPassword" && e.target.value.length == 0){
                setInputError(inputElement, "Please enter a password.");
            }
            
        });
        inputElement.addEventListener("input", e => {
            clearInputError(inputElement);       
        });
    });
});
