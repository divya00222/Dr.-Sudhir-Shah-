/**
 * Custom Nepali Date Picker (Bikram Sambat)
 * Pure Vanilla JavaScript implementation with built-in BS-AD conversions.
 */

const BS_CALENDAR_DATA = {
    2080: { startAd: '2023-04-14', months: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30] },
    2081: { startAd: '2024-04-13', months: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30] },
    2082: { startAd: '2025-04-14', months: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30] },
    2083: { startAd: '2026-04-14', months: [31, 31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30] },
    2084: { startAd: '2027-04-14', months: [31, 32, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30] },
    2085: { startAd: '2028-04-13', months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 29, 30] },
    2086: { startAd: '2029-04-14', months: [31, 31, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30] },
    2087: { startAd: '2030-04-14', months: [31, 32, 31, 31, 32, 31, 30, 29, 30, 29, 30, 30] },
    2088: { startAd: '2031-04-14', months: [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 29, 30] },
    2089: { startAd: '2032-04-13', months: [31, 32, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30] },
    2090: { startAd: '2033-04-14', months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 29, 30] },
    2091: { startAd: '2034-04-14', months: [31, 31, 31, 32, 31, 31, 30, 30, 29, 30, 30, 30] },
    2092: { startAd: '2035-04-14', months: [31, 32, 31, 31, 32, 31, 30, 29, 30, 29, 30, 30] },
    2093: { startAd: '2036-04-13', months: [31, 31, 32, 32, 31, 31, 30, 30, 29, 30, 29, 30] },
    2094: { startAd: '2037-04-14', months: [31, 32, 31, 31, 32, 31, 30, 30, 30, 29, 30, 30] },
    2095: { startAd: '2038-04-14', months: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 29, 30] }
};

const NEP_MONTHS_DEV = ['बैशाख', 'जेठ', 'असार', 'श्रावण', 'भाद्र', 'आश्विन', 'कार्तिक', 'मंसिर', 'पौष', 'माघ', 'फाल्गुण', 'चैत्र'];
const NEP_MONTHS_ENG = ['Baisakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin', 'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'];
const NEP_WEEKDAYS_DEV = ['आईत', 'सोम', 'मङ्गल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
const NEP_WEEKDAYS_ENG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const NEP_NUMS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function toNepaliDigits(num) {
    return String(num).split('').map(digit => {
        return isNaN(digit) ? digit : NEP_NUMS[Number(digit)] || digit;
    }).join('');
}

function adToBs(adDate) {
    const d = new Date(adDate);
    d.setHours(12, 0, 0, 0); // Guard against timezone offsets
    
    let bsYear = null;
    const years = Object.keys(BS_CALENDAR_DATA).map(Number).sort((a,b) => b-a);
    for (const yr of years) {
        const start = new Date(BS_CALENDAR_DATA[yr].startAd);
        start.setHours(12, 0, 0, 0);
        if (d >= start) {
            bsYear = yr;
            break;
        }
    }
    
    if (!bsYear) {
        return { year: 2083, month: 1, day: 1 };
    }
    
    const start = new Date(BS_CALENDAR_DATA[bsYear].startAd);
    start.setHours(12, 0, 0, 0);
    
    const diffTime = d.getTime() - start.getTime();
    let daysDiff = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const monthDays = BS_CALENDAR_DATA[bsYear].months;
    let bsMonth = 0;
    while (bsMonth < 12 && daysDiff >= monthDays[bsMonth]) {
        daysDiff -= monthDays[bsMonth];
        bsMonth++;
    }
    
    return {
        year: bsYear,
        month: bsMonth + 1,
        day: daysDiff + 1
    };
}

function bsToAd(year, month, day) {
    const data = BS_CALENDAR_DATA[year];
    if (!data) return new Date();
    
    const start = new Date(data.startAd);
    start.setHours(12, 0, 0, 0);
    
    let daysToAdd = 0;
    for (let m = 0; m < month - 1; m++) {
        daysToAdd += data.months[m];
    }
    daysToAdd += (day - 1);
    
    const adDate = new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    return adDate;
}

class NepaliDatePicker {
    constructor(inputElement) {
        this.input = inputElement;
        this.pickerContainer = null;
        this.selectedBs = null; // { year, month, day }
        this.currentBs = null;  // { year, month } currently viewed calendar page
        
        // Today's BS date for highlighting and disabling past dates
        const todayAd = new Date();
        this.todayBs = adToBs(todayAd);
        
        this.init();
    }
    
    init() {
        this.input.addEventListener('click', (e) => {
            e.stopPropagation();
            this.open();
        });
        
        document.addEventListener('click', (e) => {
            if (this.pickerContainer && !this.pickerContainer.contains(e.target) && e.target !== this.input) {
                this.close();
            }
        });
        
        window.addEventListener('resize', () => {
            if (this.pickerContainer) {
                this.positionPicker();
            }
        });
    }
    
    open() {
        // Close other open calendars first
        const existing = document.getElementById('nepali-datepicker-popup');
        if (existing) existing.remove();
        
        // Parse current input value if exists, otherwise set to today
        const val = this.input.value.trim();
        if (val) {
            // Support formats like "2083-06-06" or "६ असोज २०८३"
            // Simple regex match for English digits YYYY-MM-DD
            const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                this.selectedBs = {
                    year: parseInt(match[1]),
                    month: parseInt(match[2]),
                    day: parseInt(match[3])
                };
            } else {
                this.selectedBs = { ...this.todayBs };
            }
        } else {
            this.selectedBs = null;
        }
        
        // Start calendar view from selected date or today's date
        const initialView = this.selectedBs ? { ...this.selectedBs } : { ...this.todayBs };
        this.currentBs = { year: initialView.year, month: initialView.month };
        
        // Build DOM
        this.buildPickerDOM();
        this.positionPicker();
    }
    
    close() {
        if (this.pickerContainer) {
            this.pickerContainer.remove();
            this.pickerContainer = null;
        }
    }
    
    buildPickerDOM() {
        this.pickerContainer = document.createElement('div');
        this.pickerContainer.id = 'nepali-datepicker-popup';
        this.pickerContainer.className = 'nepali-datepicker-popup';
        
        this.renderCalendar();
        
        document.body.appendChild(this.pickerContainer);
    }
    
    positionPicker() {
        if (!this.pickerContainer) return;
        
        const rect = this.input.getBoundingClientRect();
        const scrollY = window.pageYOffset;
        const scrollX = window.pageXOffset;
        
        // On very small mobile screens, let it act as a centered modal
        if (window.innerWidth < 480) {
            this.pickerContainer.style.position = 'fixed';
            this.pickerContainer.style.top = '50%';
            this.pickerContainer.style.left = '50%';
            this.pickerContainer.style.transform = 'translate(-50%, -50%)';
            this.pickerContainer.style.zIndex = '10002';
            
            // Add a clean backdrop overlay
            let backdrop = document.getElementById('nepali-datepicker-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.id = 'nepali-datepicker-backdrop';
                backdrop.className = 'nepali-datepicker-backdrop';
                document.body.appendChild(backdrop);
                backdrop.addEventListener('click', () => {
                    this.close();
                    backdrop.remove();
                });
            }
            return;
        }
        
        // Desktop / larger viewports standard floating placement
        const pickerHeight = 320;
        const pickerWidth = 300;
        
        let top = rect.bottom + scrollY + 6;
        let left = rect.left + scrollX;
        
        // If it overflows the screen heightwise, show it above the input
        if (rect.bottom + pickerHeight > window.innerHeight + scrollY && rect.top - pickerHeight > scrollY) {
            top = rect.top + scrollY - pickerHeight - 6;
        }
        
        // If it overflows the screen widthwise, shift left
        if (rect.left + pickerWidth > window.innerWidth) {
            left = window.innerWidth - pickerWidth - 16;
        }
        
        this.pickerContainer.style.position = 'absolute';
        this.pickerContainer.style.top = `${top}px`;
        this.pickerContainer.style.left = `${left}px`;
        this.pickerContainer.style.transform = 'none';
        this.pickerContainer.style.zIndex = '10001';
        
        // Clean any stale mobile backdrops
        const backdrop = document.getElementById('nepali-datepicker-backdrop');
        if (backdrop) backdrop.remove();
    }
    
    renderCalendar() {
        const year = this.currentBs.year;
        const month = this.currentBs.month;
        
        const monthIndex = month - 1;
        const monthNameDev = NEP_MONTHS_DEV[monthIndex];
        const monthNameEng = NEP_MONTHS_ENG[monthIndex];
        
        const yearDev = toNepaliDigits(year);
        
        // Days in the current viewed month
        const totalDays = BS_CALENDAR_DATA[year] ? BS_CALENDAR_DATA[year].months[monthIndex] : 30;
        
        // Calculate the starting weekday of Baisakh 1, then calculate start of current month
        const startWeekday = this.getMonthStartWeekday(year, monthIndex);
        
        // Construct calendar HTML
        let html = `
            <div class="ndp-header">
                <button class="ndp-prev-btn" aria-label="Previous Month">&lsaquo;</button>
                <div class="ndp-title-wrapper">
                    <span class="ndp-title-nep">${monthNameDev} ${yearDev}</span>
                    <span class="ndp-title-eng">${monthNameEng} ${year}</span>
                </div>
                <button class="ndp-next-btn" aria-label="Next Month">&rsaquo;</button>
            </div>
            
            <div class="ndp-weekdays">
        `;
        
        // Render weekday labels (English abbreviations with custom tooltips)
        NEP_WEEKDAYS_ENG.forEach((wd, idx) => {
            html += `<span class="ndp-weekday" title="${NEP_WEEKDAYS_DEV[idx]}">${wd}</span>`;
        });
        
        html += `</div><div class="ndp-days">`;
        
        // Render leading blank slots
        for (let i = 0; i < startWeekday; i++) {
            html += `<span class="ndp-day empty"></span>`;
        }
        
        // Render selectable day slots
        const todayAd = new Date();
        todayAd.setHours(0, 0, 0, 0);
        
        for (let d = 1; d <= totalDays; d++) {
            // Match with selected day
            const isSelected = this.selectedBs && 
                               this.selectedBs.year === year && 
                               this.selectedBs.month === month && 
                               this.selectedBs.day === d;
                               
            // Match with today
            const isToday = this.todayBs.year === year && 
                            this.todayBs.month === month && 
                            this.todayBs.day === d;
                            
            // Validate and disable past dates for appointments
            const targetAd = bsToAd(year, month, d);
            targetAd.setHours(0, 0, 0, 0);
            const isPast = targetAd < todayAd;
            
            let classes = ['ndp-day'];
            if (isSelected) classes.push('selected');
            if (isToday) classes.push('today');
            if (isPast) classes.push('past-disabled');
            
            const nepaliDigitsStr = toNepaliDigits(d);
            
            html += `<span class="${classes.join(' ')}" data-day="${d}" ${isPast ? 'disabled' : ''}>
                <span class="day-num-eng">${d}</span>
                <span class="day-num-nep">${nepaliDigitsStr}</span>
            </span>`;
        }
        
        html += `</div>`;
        
        this.pickerContainer.innerHTML = html;
        
        // Attach interactive event listeners
        this.attachEventListeners();
    }
    
    getMonthStartWeekday(year, monthIndex) {
        const data = BS_CALENDAR_DATA[year];
        if (!data) return 0;
        const baisakhStart = new Date(data.startAd);
        baisakhStart.setHours(12, 0, 0, 0);
        const baisakhWeekday = baisakhStart.getDay(); // 0 is Sunday
        
        let totalDays = 0;
        for (let m = 0; m < monthIndex; m++) {
            totalDays += data.months[m];
        }
        return (baisakhWeekday + totalDays) % 7;
    }
    
    attachEventListeners() {
        // Prev Month click
        const prevBtn = this.pickerContainer.querySelector('.ndp-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateMonth(-1);
            });
        }
        
        // Next Month click
        const nextBtn = this.pickerContainer.querySelector('.ndp-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.navigateMonth(1);
            });
        }
        
        // Selectable day click
        const dayElements = this.pickerContainer.querySelectorAll('.ndp-day:not(.empty):not(.past-disabled)');
        dayElements.forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const selectedDay = parseInt(el.getAttribute('data-day'));
                this.selectDate(selectedDay);
            });
        });
    }
    
    navigateMonth(direction) {
        let year = this.currentBs.year;
        let month = this.currentBs.month + direction;
        
        if (month < 1) {
            month = 12;
            year--;
        } else if (month > 12) {
            month = 1;
            year++;
        }
        
        // Bound checks against available data (2080 - 2095)
        if (BS_CALENDAR_DATA[year]) {
            this.currentBs = { year, month };
            this.renderCalendar();
        }
    }
    
    selectDate(day) {
        const year = this.currentBs.year;
        const month = this.currentBs.month;
        
        this.selectedBs = { year, month, day };
        
        // Build both display styles: YYYY-MM-DD and Nepali BS text
        const mmString = String(month).padStart(2, '0');
        const ddString = String(day).padStart(2, '0');
        
        const bsFormattedEnglish = `${year}-${mmString}-${ddString}`;
        const bsFormattedNepali = `${toNepaliDigits(day)} ${NEP_MONTHS_DEV[month - 1]} ${toNepaliDigits(year)}`;
        
        // Set visible input text showing both formats beautifully
        this.input.value = `${bsFormattedEnglish} (${bsFormattedNepali})`;
        
        // Store corresponding AD date in input data attribute for backend processing
        const adEquivalent = bsToAd(year, month, day);
        const yyyyAd = adEquivalent.getFullYear();
        const mmAd = String(adEquivalent.getMonth() + 1).padStart(2, '0');
        const ddAd = String(adEquivalent.getDate()).padStart(2, '0');
        const adFormatted = `${yyyyAd}-${mmAd}-${ddAd}`;
        
        this.input.setAttribute('data-ad-date', adFormatted);
        this.input.setAttribute('data-bs-year', year);
        this.input.setAttribute('data-bs-month', month);
        this.input.setAttribute('data-bs-day', day);
        
        // Dispatch custom change event to trigger form validation
        this.input.dispatchEvent(new Event('change'));
        
        // Cleanup picker elements
        this.close();
        const backdrop = document.getElementById('nepali-datepicker-backdrop');
        if (backdrop) backdrop.remove();
    }
}

// Global initialization helper
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('preferredDate');
    if (dateInput) {
        new NepaliDatePicker(dateInput);
    }
});
