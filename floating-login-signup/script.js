document.querySelector('.img-btn').addEventListener('click', function()
	{
		document.querySelector('.cont').classList.toggle('s-signup')
	}
);

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const signupForm = document.getElementById('sign-up');
const passwordMismatch = document.getElementById('mismatchPassword');

function passwordMatch(){
	const passwordValue = password.value;
	const confirmPasswordValue = confirmPassword.value;

	if (passwordValue === confirmPasswordValue) {
		passwordMismatch.style.display = 'none';
		return true;
	} else {
		passwordMismatch.style.display = 'block';
		return false;
	}
}

signupForm.addEventListener('submit',(e)=>{
	if (!passwordMatch()) {
		e.preventDefault();
	}
})
