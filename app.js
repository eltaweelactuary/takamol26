import { CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 5;

    // DOM Elements
    const modal = document.getElementById('formModal');
    const form = document.getElementById('takamolForm');
    const successMsg = document.getElementById('successMsg');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    const dots = document.querySelectorAll('.dot');
    const userTypeSelect = document.getElementById('userType');
    const insuranceTypeSelect = document.getElementById('insuranceType');
    const dynamicSpecsContainer = document.getElementById('dynamicSpecsContainer');

    // --- Modal Logic ---
    document.querySelectorAll('.open-form-btn').forEach(btn => {
        btn.onclick = () => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            resetForm();
        };
    });

    document.querySelector('.close-modal').onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    const resetForm = () => {
        currentStep = 1;
        form.reset();
        form.style.display = 'block';
        successMsg.style.display = 'none';
        updateStep();
    };

    // --- Navigation Logic ---
    const updateStep = () => {
        document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.add('active');
        
        // Dots
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.dataset.step) <= currentStep) dot.classList.add('active');
        });

        // Buttons
        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        if (currentStep === totalSteps) {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        } else {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        }

        // Logic for specific steps
        if (currentStep === 2) updateKYCLabels();
        if (currentStep === 3) populateInsuranceOptions();
        if (currentStep === 4) populateTechnicalSpecs();
    };

    nextBtn.onclick = () => {
        if (validateStep()) {
            currentStep++;
            updateStep();
            modal.scrollTo(0, 0);
        }
    };

    prevBtn.onclick = () => {
        currentStep--;
        updateStep();
        modal.scrollTo(0, 0);
    };

    const validateStep = () => {
        const activeStep = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = activeStep.querySelectorAll('[required]');
        let valid = true;
        
        inputs.forEach(input => {
            if (!input.value || (input.type === 'checkbox' && !input.checked)) {
                input.style.borderColor = '#ef4444';
                valid = false;
            } else {
                input.style.borderColor = 'rgba(15, 23, 42, 0.1)';
            }
        });

        if (!valid) alert('يرجى ملء كافة الحقول المطلوبة للمتابعة.');
        return valid;
    };

    // --- Dynamic Logic Functions ---

    const updateKYCLabels = () => {
        const type = userTypeSelect.value;
        const nameLabel = document.getElementById('nameLabel');
        const idLabel = document.getElementById('idLabel');
        const corporateFields = document.getElementById('corporateOnlyFields');

        if (type === 'corporate') {
            nameLabel.innerText = 'اسم الشركة (كما في السجل)';
            idLabel.innerText = 'رقم السجل التجاري والبطاقة الضريبية';
            corporateFields.style.display = 'block';
        } else {
            nameLabel.innerText = 'الاسم الرباعي (من البطاقة)';
            idLabel.innerText = 'الرقم القومي (14 رقم)';
            corporateFields.style.display = 'none';
        }
    };

    const populateInsuranceOptions = () => {
        const type = userTypeSelect.value;
        let options = '<option value="">اختر...</option>';
        
        if (type === 'individual') {
            options += `
                <option value="individual-car">تأمين سيارات فردي</option>
                <option value="individual-medical">تأمين طبي فردي/عائلي</option>
                <option value="individual-property">تأمين مسكن</option>
                <option value="individual-life">تأمين حماية وادخار</option>
            `;
        } else {
            options += `
                <option value="group-medical">تأمين طبي جماعي</option>
                <option value="corporate-property">تأمين حريق وسطو</option>
                <option value="motor-fleet">تأمين أسطول سيارات</option>
                <option value="marine">تأمين نقل بحري/بري</option>
            `;
        }
        insuranceTypeSelect.innerHTML = options;
    };

    const populateTechnicalSpecs = () => {
        const insType = insuranceTypeSelect.value;
        let html = '';

        const field = (label, name, type = 'text', required = true) => `
            <div class="form-group">
                <label>${label}</label>
                <input type="${type}" name="${name}" ${required ? 'required' : ''} placeholder="أدخل ${label}...">
            </div>`;

        const grid = (content) => `<div class="form-grid">${content}</div>`;

        switch(insType) {
            case 'individual-car':
                html = grid(field('ماركة السيارة', 'carMake') + field('الموديل وسنة الصنع', 'carModel')) + 
                       field('القيمة التقديرية الحالية', 'carValue', 'number');
                break;
            case 'individual-medical':
                html = field('تاريخ ميلاد العميل', 'customerDob', 'date') + 
                       `<div class="form-group"><label>هل تعاني من أمراض مزمنة؟</label>
                        <select name="chronicDiseases"><option value="لا">لا</option><option value="نعم">نعم</option></select></div>`;
                break;
            case 'individual-property':
                html = field('عنوان العقار بالتفصيل', 'propertyAddress') + 
                       grid(field('قيمة المبنى الـتأمينية', 'buildingValue', 'number') + 
                            field('قيمة المحتويات (إن وجد)', 'contentValue', 'number', false));
                break;
            case 'individual-life':
                html = field('تاريخ الميلاد', 'lifeDob', 'date') + 
                       grid(field('مبلغ التأمين المستهدف', 'lifeCoverage', 'number') + 
                            field('مدة التأمين (سنوات)', 'lifeDuration', 'number'));
                break;
            case 'group-medical':
                html = field('إجمالي عدد الموظفين', 'employeeCount', 'number') + 
                       grid(field('متوسط الأعمار', 'avgAge', 'number') + 
                            field('الشبكة الطبية المطلوبة (A/B/C)', 'medicalNetwork'));
                break;
            case 'corporate-property':
                html = field('موقع المصنع/المخزن', 'corpPropertyLoc') + 
                       grid(field('طبيعة النشاط', 'businessActivity') + 
                            field('وسائل الإطفاء المتاحة', 'fireSafety'));
                break;
            case 'motor-fleet':
                html = field('عدد السيارات في الأسطول', 'fleetCount', 'number') + 
                       field('طبيعة استخدام الأسطول (نقل/ملاكي)', 'fleetUsage');
                break;
            case 'marine':
                html = field('نوع البضاعة المشحونة', 'marineCargo') + 
                       grid(field('وسيلة النقل (بحري/جوي/بري)', 'transportMode') + 
                            field('خط السير (من/إلى)', 'marineRoute'));
                break;
            default:
                html = `<p style="color:var(--text-muted)">يرجى كتابة أي تفاصيل إضافية عن نوع التأمين المطلوب هنا</p>
                        <textarea name="extraDetails" rows="4" style="width:100%; margin-top:10px; border-radius:12px; padding:10px;"></textarea>`;
        }
        
        dynamicSpecsContainer.innerHTML = html;
        dynamicSpecsContainer.classList.add('animate-reveal');
    };

    // --- Submit Logic ---
    form.onsubmit = async (e) => {
        e.preventDefault();
        
        if (!CONFIG.googleScriptUrl || CONFIG.googleScriptUrl.includes('REPLACE')) {
            alert('يرجى ضبط رابط الـ Script أولاً في ملف config.js');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = 'جاري الإرسال...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.timestamp = new Date().toLocaleString();

        try {
            await fetch(CONFIG.googleScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            // Add a small delay to make it feel "Premium"
            setTimeout(() => {
                form.style.display = 'none';
                successMsg.style.display = 'block';
                modal.scrollTo(0, 0);
                
                // Trigger confetti if library exists or just smooth fade
                successMsg.classList.add('animate-reveal');
            }, 800);

        } catch (error) {
            console.error('Error:', error);
            alert('حدث خطأ أثناء الإرسال، يرجى المحاولة لاحقاً');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'تقديم الطلب';
        }
    };
});
