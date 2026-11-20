(function () {
	const form = document.getElementById("industrial-login-form");
	if (!form) return;
	const error = document.getElementById("login-error");
	const password = document.getElementById("login-password");
	const toggle = document.querySelector(".password-toggle");
	if (toggle) toggle.addEventListener("click", function () {
		const visible = password.type === "password";
		password.type = visible ? "text" : "password";
		toggle.textContent = visible ? "Hide" : "Show";
		toggle.setAttribute("aria-label", visible ? "Hide password" : "Show password");
	});
	fetch("/api/method/frappe.auth.get_logged_user", { credentials: "same-origin" })
		.then((response) => response.json())
		.then((data) => { if (data.message && data.message !== "Guest") window.location.replace("/industrial-portal"); })
		.catch(() => {});
	form.addEventListener("submit", async function (event) {
		event.preventDefault();
		error.hidden = true;
		const button = form.querySelector("button[type=submit]");
		button.disabled = true;
		button.querySelector("span").textContent = "Signing in…";
		try {
			const response = await fetch("/api/method/login", {
				method: "POST", credentials: "same-origin",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				body: JSON.stringify({ usr: form.elements.usr.value.trim(), pwd: form.elements.pwd.value }),
			});
			const result = await response.json();
			if (!response.ok || (result.message && result.message !== "Logged In")) throw new Error(result.message || "Unable to sign in. Check your credentials.");
			window.location.assign("/industrial-portal");
		} catch (err) {
			error.textContent = err.message || "Unable to sign in. Please try again.";
			error.hidden = false;
			button.disabled = false;
			button.querySelector("span").textContent = "Sign in to workspace";
		}
	});
})();
