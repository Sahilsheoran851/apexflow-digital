/**
 * ApexFlow Digital — Workflow Automation ROI Calculator
 * Calculates hours & AED saved monthly through automated operations
 */

document.addEventListener('DOMContentLoaded', () => {
  const teamSizeSlider = document.getElementById('calc-team-size');
  const hoursSlider = document.getElementById('calc-hours-manual');
  const hourlyRateSlider = document.getElementById('calc-hourly-rate');

  const teamSizeVal = document.getElementById('val-team-size');
  const hoursVal = document.getElementById('val-hours-manual');
  const hourlyRateVal = document.getElementById('val-hourly-rate');

  const hoursSavedDisplay = document.getElementById('roi-hours-saved');
  const moneySavedDisplay = document.getElementById('roi-money-saved');
  const annualSavingsDisplay = document.getElementById('roi-annual-savings');

  if (!teamSizeSlider || !hoursSlider || !hourlyRateSlider) return;

  function calculateROI() {
    const teamSize = parseInt(teamSizeSlider.value, 10);
    const weeklyHoursPerPerson = parseInt(hoursSlider.value, 10);
    const hourlyRateAED = parseInt(hourlyRateSlider.value, 10);

    // Update labels
    teamSizeVal.textContent = teamSize + (teamSize === 1 ? ' Person' : ' People');
    hoursVal.textContent = weeklyHoursPerPerson + ' Hours/Week';
    hourlyRateVal.textContent = hourlyRateAED + ' AED/Hr';

    // Automation saves approximately 75% of manual repetitive tasks (data entry, lead qualification, manual reports)
    const totalWeeklyManualHours = teamSize * weeklyHoursPerPerson;
    const weeklyHoursSaved = Math.round(totalWeeklyManualHours * 0.75);
    const monthlyHoursSaved = weeklyHoursSaved * 4.2;

    const monthlyCostSaved = Math.round(monthlyHoursSaved * hourlyRateAED);
    const annualCostSaved = monthlyCostSaved * 12;

    if (hoursSavedDisplay) hoursSavedDisplay.textContent = Math.round(monthlyHoursSaved) + ' hrs/mo';
    if (moneySavedDisplay) moneySavedDisplay.textContent = 'AED ' + monthlyCostSaved.toLocaleString();
    if (annualSavingsDisplay) annualSavingsDisplay.textContent = 'AED ' + annualCostSaved.toLocaleString() + ' / year';

    const whatsappCTA = document.getElementById('roi-whatsapp-cta');
    if (whatsappCTA) {
      const msg = encodeURIComponent(
        `Hi Sahil! I used your ApexFlow ROI calculator for my team (${teamSize} people). It estimated we could save AED ${monthlyCostSaved.toLocaleString()}/mo (${Math.round(monthlyHoursSaved)} hrs/mo) with automated pipelines. Let's discuss!`
      );
      whatsappCTA.href = `https://wa.me/971507507963?text=${msg}`;
    }
  }

  teamSizeSlider.addEventListener('input', calculateROI);
  hoursSlider.addEventListener('input', calculateROI);
  hourlyRateSlider.addEventListener('input', calculateROI);

  // Initialize defaults
  calculateROI();
});
