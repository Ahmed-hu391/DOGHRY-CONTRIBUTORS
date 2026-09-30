const SUPABASE_URL = 'https://ubwutnxafcrcpylpvqgs.supabase.co';
const SUPABASE_KEY = 'sb_publishable_NSZ3i0xOCLLx9bH3zgGJuQ_rWCjJoRJ';
let sb = null;
try {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (e) {
  console.error('Supabase failed to load:', e);
}

const root = document.documentElement;
const intro = document.getElementById('intro');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('drawer');
const drawerBackdrop = document.getElementById('drawerBackdrop');
const drawerClose = document.getElementById('drawerClose');
const toast = document.getElementById('toast');

async function runIntro() {
  const progressBar = document.getElementById('introProgress');
  const progressText = document.getElementById('introPercent');
  const assetsToLoad = [
    'assets/logo-removebg-preview.png','assets/ahmed.jpg','assets/moheab.jpg','assets/syoda.jpg'
  ];
  const started = performance.now();
  const total = assetsToLoad.length + 1;
  let loaded = 0;
  const setProgress = value => {
    const safe = Math.max(0, Math.min(100, value));
    if (progressBar) progressBar.style.width = safe + '%';
    if (progressText) progressText.textContent = Math.round(safe) + '%';
  };
  setProgress(0);
  const preload = src => new Promise(resolve => {
    const img = new Image();
    const done = () => { loaded += 1; setProgress((loaded / total) * 100); resolve(); };
    img.onload = done; img.onerror = done; img.src = src;
  });
  const fontReady = (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
    .then(() => { loaded += 1; setProgress((loaded / total) * 100); });
  await Promise.all([...assetsToLoad.map(preload), fontReady]);
  const minimumTime = 1500;
  const remaining = Math.max(0, minimumTime - (performance.now() - started));
  if (remaining) await new Promise(r => setTimeout(r, remaining));
  setProgress(100);
  document.body.classList.add('site-ready');
  intro.classList.add('hide');
  setTimeout(() => intro.remove(), 1250);
}
runIntro();

function applyTheme(theme) {
  root.dataset.theme = theme;
  themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
}
const savedTheme = localStorage.getItem('dughri-theme') || 'light';
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('dughri-theme', next);
});

function openDrawer(){drawer.classList.add('open');drawerBackdrop.classList.add('open');document.body.classList.add('drawer-open');}
function closeDrawer(){drawer.classList.remove('open');drawerBackdrop.classList.remove('open');document.body.classList.remove('drawer-open');}
menuBtn.addEventListener('click', openDrawer);
drawerClose.addEventListener('click', closeDrawer);
drawerBackdrop.addEventListener('click', closeDrawer);
drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

// Fluid in-page navigation: one calm animation, cancellable by the user's own scrolling.
let scrollAnimationFrame = null;
let isProgrammaticScroll = false;

function cancelSmoothScroll(){
  if(scrollAnimationFrame){
    cancelAnimationFrame(scrollAnimationFrame);
    scrollAnimationFrame = null;
  }
  isProgrammaticScroll = false;
}

function smoothTo(targetId){
  const target=document.querySelector(targetId);
  if(!target) return;
  cancelSmoothScroll();

  const headerOffset=window.innerWidth<=600 ? 76 : 92;
  const start=window.scrollY;
  const end=Math.max(0,target.getBoundingClientRect().top + window.scrollY - headerOffset);
  const distance=end-start;
  const duration=Math.min(1150,Math.max(650,Math.abs(distance)*0.7));
  const startTime=performance.now();
  const ease=t=>1-Math.pow(1-t,5);

  target.classList.remove('section-focus');
  void target.offsetWidth;
  target.classList.add('section-focus');
  isProgrammaticScroll = true;

  function frame(now){
    const progress=Math.min(1,(now-startTime)/duration);
    window.scrollTo(0,start + distance*ease(progress));
    if(progress<1){
      scrollAnimationFrame=requestAnimationFrame(frame);
    }else{
      scrollAnimationFrame=null;
      setTimeout(()=>{
        target.classList.remove('section-focus');
        isProgrammaticScroll=false;
      },650);
    }
  }
  scrollAnimationFrame=requestAnimationFrame(frame);
}

window.addEventListener('wheel', cancelSmoothScroll, {passive:true});
window.addEventListener('touchstart', cancelSmoothScroll, {passive:true});

// One observer controls the entrance choreography. Items reveal as they enter the viewport.
const revealTargets = [
  '.reveal',
  '.contribution-choice',
  '.form-section-title',
  '.field',
  '.privacy-note',
  '.submit-btn',
  '.hero-actions',
  '.hero-note',
  '.review-banner',
  '.empty-board',
  '.team-card'
].join(',');

const revealNodes=[...document.querySelectorAll(revealTargets)];
revealNodes.forEach((item,index)=>{
  item.classList.add('scroll-reveal');
  item.style.setProperty('--reveal-delay', `${Math.min(index % 5,4)*65}ms`);
});

if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.14,rootMargin:'0px 0px -80px 0px'});
  document.querySelectorAll('.reveal, .scroll-reveal').forEach(item=>observer.observe(item));
}else{
  document.querySelectorAll('.reveal, .scroll-reveal').forEach(item=>item.classList.add('visible'));
}

const sections=[...document.querySelectorAll('main section[id]')];
const navLinks=[...document.querySelectorAll('.desktop-links a, .drawer-links a')];
function updateActiveNav(){
  let current='home'; const point=window.scrollY+window.innerHeight*.28;
  sections.forEach(section=>{if(point>=section.offsetTop) current=section.id;});
  navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+current));
}
let navTick=false;
window.addEventListener('scroll',()=>{if(navTick)return;navTick=true;requestAnimationFrame(()=>{navTick=false;updateActiveNav();});},{passive:true});
updateActiveNav();

function showToast(message){
  toast.textContent=message; toast.classList.add('show'); clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove('show'),3600);
}

// Contribution choices
const choiceButtons=[...document.querySelectorAll('.contribution-choice')];
const surveyBox=document.getElementById('surveyBox');
const backToChoices=document.getElementById('backToChoices');
const contributionType=document.getElementById('contributionType');
const surveyTitle=document.getElementById('surveyTitle');
const surveyTypeLabel=document.getElementById('surveyTypeLabel');
const dynamicFields=[...document.querySelectorAll('.dynamic-fields')];
const requiredByType={
  route:['routeFrom','routeTo','routeStops'],
  stop:['stopName','stopArea','stopDetails'],
  correction:['correctionSubject','correctionDetails'],
  driver:['driverRoute','driverDetails']
};
const labels={
  route:['إضافة خط مواصلات','خط جديد'],
  stop:['إضافة موقف أو نقطة ركوب','موقف / نقطة'],
  correction:['تصحيح معلومة','تصحيح'],
  driver:['معلومات من سائق','سائق']
};
function setRequired(type){
  document.querySelectorAll('#contributionForm input, #contributionForm textarea, #contributionForm select').forEach(el=>el.required=false);
  document.getElementById('contributorName').required=true;
  (requiredByType[type]||[]).forEach(id=>document.getElementById(id).required=true);
}
function openSurvey(type){
  contributionType.value=type;
  choiceButtons.forEach(btn=>btn.classList.toggle('selected',btn.dataset.type===type));
  dynamicFields.forEach(block=>block.classList.toggle('active',block.id===type+'Fields'));
  surveyTypeLabel.textContent=labels[type][1];
  surveyTitle.textContent=labels[type][0];
  surveyBox.classList.remove('active');
  void surveyBox.offsetWidth;
  surveyBox.classList.add('active');
  surveyBox.setAttribute('aria-hidden','false');
  setRequired(type);
  // No second page scroll here: the form opens exactly where the user clicked.
  // على الموبايل: مانفتحش الكيبورد تلقائيًا (كان بيغطي الفورم ويعمل zoom)، بنوصّل المستخدم للفورم بهدوء
  if(window.matchMedia('(max-width:850px)').matches){
    setTimeout(()=>{
      const top=surveyBox.getBoundingClientRect().top;
      if(top>window.innerHeight*0.6 || top<60) smoothTo('#surveyBox');
    },260);
  }
}
function resetSurvey(){
  surveyBox.classList.remove('active'); surveyBox.setAttribute('aria-hidden','true');
  choiceButtons.forEach(btn=>btn.classList.remove('selected'));
  contributionType.value=''; dynamicFields.forEach(block=>block.classList.remove('active'));
  document.querySelectorAll('#contributionForm input, #contributionForm textarea, #contributionForm select').forEach(el=>el.required=false);
}
choiceButtons.forEach(btn=>btn.addEventListener('click',()=>openSurvey(btn.dataset.type)));
backToChoices.addEventListener('click',()=>resetSurvey());

const fieldsByType={
  route:['routeFrom','routeTo','routeStops','routeTransport','routeFare'],
  stop:['stopName','stopArea','stopDetails','stopTransport'],
  correction:['correctionSubject','correctionDetails'],
  driver:['driverRoute','driverTransport','driverDetails','driverExtra']
};

document.getElementById('contributionForm').addEventListener('submit', async event=>{
  event.preventDefault();
  const name=document.getElementById('contributorName').value.trim();
  const phone=document.getElementById('contributorPhone').value.trim();
  const type=contributionType.value;
  if(!name || !phone || !type){showToast('اختار نوع المساهمة وكمل الاسم ورقم الموبايل الأول.');return;}
  if(!event.target.checkValidity()){event.target.reportValidity();return;}

  if(!sb){
    showToast('مفيش اتصال بقاعدة البيانات دلوقتي، جرب تاني.');
    return;
  }

  const data={};
  (fieldsByType[type]||[]).forEach(id=>{
    const el=document.getElementById(id);
    if(el) data[id]=el.value.trim();
  });

  const submitBtn=event.target.querySelector('.submit-btn');
  submitBtn.disabled=true;

  data.phone = phone;

  const {error}=await sb.from('contributions').insert({
    contributor_name:name,
    phone:phone,
    type:type,
    data:data,
    status:'pending',
    points:0
  });

  submitBtn.disabled=false;

  if(error){
    console.error(error);
    showToast('حصل خطأ في الإرسال: ' + (error.message || 'راجع إعدادات Supabase.'));
    return;
  }

  showToast('تمام يا '+name+' — المعلومة وصلت للمراجعة الأول.');
  event.target.reset(); resetSurvey();
});

// Contributors board — loads approved contributions and groups by contributor
async function loadContributors(){
  if(!sb) return; // keep empty state if Supabase isn't available
  const emptyBoard=document.getElementById('contributorsEmpty');
  const grid=document.getElementById('contributorsGrid');

  const {data,error}=await sb
    .from('approved_contributors_public')
    .select('contributor_name, points');

  if(error){
    console.error(error);
    // نحاول مرة كمان، ولو فشلت نقول للمستخدم بدل ما اللوحة تفضل فاضية من غير سبب
    if(!loadContributors.retried){loadContributors.retried=true;setTimeout(loadContributors,2500);return;}
    const h=emptyBoard.querySelector('h3'),p=emptyBoard.querySelector('p');
    if(h)h.textContent='مقدرناش نحمّل لوحة المساهمين';
    if(p)p.textContent='اتأكد من النت وجرّب تاني.';
    return;
  }
  if(!data || data.length===0) return; // keep empty state as-is

  const stats={};
  data.forEach(row=>{
    const name=String(row.contributor_name||'مساهم').trim();
    if(!stats[name]) stats[name]={count:0,points:0};
    stats[name].count += 1;
    stats[name].points += Number(row.points)||0;
  });

  const names=Object.keys(stats).sort((a,b)=>stats[b].points-stats[a].points || stats[b].count-stats[a].count || a.localeCompare(b,'ar'));

  const escapeHTML = value => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[char]));

  const BOARD_PAGE=10;
  let shownCount=BOARD_PAGE;
  const renderBoard=()=>{
  grid.innerHTML=names.slice(0,shownCount).map((name,index)=>{
    const initial=escapeHTML(name.trim().charAt(0).toUpperCase());
    const safeName=escapeHTML(name);
    const count=stats[name].count;
    const points=stats[name].points;
    const rank=index+1;
    const label=count===1 ? 'مساهمة معتمدة' : 'مساهمات معتمدة';
    const rankClass=rank===1 ? ' top-contributor' : '';
    const rankLabel=rank===1 ? 'المركز الأول' : `#${rank}`;
    return `<div class="contributor-card scroll-reveal${rankClass}" style="--reveal-delay:${Math.min(index,5)*70}ms">
      <div class="contributor-rank">${rankLabel}</div>
      <div class="contributor-avatar">${initial}</div>
      <div class="contributor-info"><strong>${safeName}</strong><small>${count} ${label} · ${points} نقطة</small></div>
      ${rank===1 ? '<div class="gold-crown" aria-hidden="true">♛</div>' : ''}
    </div>`;
  }).join('');
  let more=document.getElementById('boardMore');
  if(!more){
    more=document.createElement('button');more.type='button';more.id='boardMore';more.className='board-more';
    grid.insertAdjacentElement('afterend',more);
    more.addEventListener('click',()=>{shownCount+=BOARD_PAGE;renderBoard();});
  }
  more.hidden=shownCount>=names.length;
  more.textContent=`عرض الباقي (${names.length-shownCount})`;
  grid.querySelectorAll('.scroll-reveal').forEach(el=>el.classList.add('visible'));
  };
  renderBoard();

  emptyBoard.style.display='none';
  grid.setAttribute('aria-hidden','false');
}
loadContributors();

const glow=document.getElementById('cursorGlow');
if (glow && window.matchMedia('(pointer:fine)').matches) {
  window.addEventListener('pointermove',event=>{glow.style.left=event.clientX+'px';glow.style.top=event.clientY+'px';},{passive:true});
}
