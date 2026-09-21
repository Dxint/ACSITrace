(function () {
  "use strict";

  const form = document.getElementById("gts-form");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".survey-step"));
  const stepById = new Map(steps.map((s) => [s.dataset.step, s]));
  const progressLabel = document.getElementById("progress-label");
  const progressBar = document.getElementById("progress-bar");
  const wizard = document.getElementById("survey-wizard");
  const successPanel = document.getElementById("survey-success");

  const visited = [steps[0].dataset.step];

  function currentStep() {
    return stepById.get(visited[visited.length - 1]);
  }

  function updateProgress() {
    const pct = Math.min(100, Math.round((visited.length / steps.length) * 100));
    progressBar.style.width = pct + "%";
    progressLabel.textContent = `Step ${visited.length}`;
  }

  function updateBackButton(step) {
    const backBtn = step.querySelector('[data-action="back"]');
    if (backBtn) backBtn.hidden = visited.length <= 1;
  }

  function showStep(id) {
    steps.forEach((s) => {
      const isCurrent = s.dataset.step === id;
      s.hidden = !isCurrent;
      // A disabled fieldset's controls are excluded from constraint validation,
      // so reportValidity() on the whole form only checks the visible step.
      s.disabled = !isCurrent;
    });
    const step = stepById.get(id);
    updateBackButton(step);
    updateProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const firstField = step.querySelector("input:not([type=hidden]), select, textarea");
    if (firstField) firstField.focus({ preventScroll: true });
  }

  function selectedValue(controller) {
    if (!controller) return null;
    if (controller.tagName === "SELECT") return controller.value || null;
    return controller.checked ? controller.value : null;
  }

  function resolveNext(step) {
    const branchHost = step.querySelector("[data-branches]");
    if (branchHost) {
      const branches = JSON.parse(branchHost.dataset.branches);
      let value = null;
      if (branchHost.tagName === "SELECT") {
        value = branchHost.value || null;
      } else {
        const checked = branchHost.querySelector("input:checked");
        value = checked ? checked.value : null;
      }
      if (value && Object.prototype.hasOwnProperty.call(branches, value)) {
        return String(branches[value]);
      }
    }
    return step.dataset.next || null;
  }

  // Show/hide fields that only apply when a preceding answer equals a value
  // (e.g. "IF OTHERS PLEASE SPECIFY" following a degree dropdown).
  function evaluateDependents() {
    form.querySelectorAll("[data-depends-on]").forEach((el) => {
      const fieldId = el.dataset.dependsOn;
      const expected = el.dataset.dependsEquals;
      const controller =
        form.querySelector(`select[name="field_${fieldId}"]`) ||
        form.querySelector(`input[name="field_${fieldId}"]:checked`);
      const value = selectedValue(controller);
      const show = value === expected;
      el.hidden = !show;
      el.querySelectorAll("input, select, textarea").forEach((i) => {
        i.disabled = !show;
      });
    });
  }

  // Reveal the free-text box paired with an inline "Other (please specify)" choice.
  function evaluateOthers() {
    form.querySelectorAll("[data-other-for]").forEach((box) => {
      const fieldId = box.dataset.otherFor;
      const controllers = form.querySelectorAll(`[name="field_${fieldId}"]`);
      let isOther = false;
      controllers.forEach((c) => {
        const value = c.tagName === "SELECT" ? c.value : c.checked ? c.value : null;
        if (value === "Other (please specify)") isOther = true;
      });
      box.hidden = !isOther;
      box.querySelectorAll("input").forEach((i) => {
        i.disabled = !isOther;
      });
    });
  }

  function refreshConditionals() {
    evaluateDependents();
    evaluateOthers();
  }

  form.addEventListener("change", refreshConditionals);
  refreshConditionals();

  form.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-action]");
    if (!btn) return;
    const step = currentStep();

    if (btn.dataset.action === "next") {
      if (!form.reportValidity()) return;
      const next = resolveNext(step);
      if (next && stepById.has(next)) {
        visited.push(next);
        showStep(next);
      }
    } else if (btn.dataset.action === "back") {
      if (visited.length > 1) {
        visited.pop();
        showStep(visited[visited.length - 1]);
      }
    } else if (btn.dataset.action === "submit") {
      form.requestSubmit();
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const submitBtn = form.querySelector('[data-action="submit"]');
    const original = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }

    // Temporarily re-enable every step so FormData captures answers from
    // every visited page, not just the currently displayed one.
    steps.forEach((s) => {
      s.disabled = false;
    });
    const formData = new FormData(form);
    steps.forEach((s) => {
      s.disabled = s.dataset.step !== visited[visited.length - 1];
    });

    const payload = {};
    for (const [key, value] of formData.entries()) {
      if (key in payload) {
        payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
      } else {
        payload[key] = value;
      }
    }

    try {
      const res = await fetch(form.dataset.submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      wizard.hidden = true;
      successPanel.hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert("Something went wrong submitting the survey. Please try again.");
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }
    }
  });

  showStep(visited[0]);
})();
