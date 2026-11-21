export type SeoPageCategory = 'service' | 'district';

export interface SeoScenario {
  title: string;
  description: string;
}

export interface SeoProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface SeoFaqItem {
  question: string;
  answer: string;
}

export interface SeoContextualLink {
  path: string;
  anchor: string;
  context: string;
}

export interface SeoPageData {
  slug: string;
  path: string;
  category: SeoPageCategory;
  navLabel: string;
  breadcrumbParent: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  kicker: string;
  lead: string;
  platformAngleTitle: string;
  platformAngleBody: string;
  intentSectionTitle: string;
  intentParagraphs: string[];
  scenariosTitle: string;
  scenarios: SeoScenario[];
  processTitle: string;
  processSteps: SeoProcessStep[];
  highlightsTitle: string;
  highlightsSubtitle: string;
  highlights: { label: string; detail: string }[];
  comparisonTitle: string;
  comparisonPoints: { traditional: string; platform: string }[];
  contextualLinks: SeoContextualLink[];
  faqs: SeoFaqItem[];
  serviceType: string;
  areaServed: string[];
  geoCenter?: { lat: number; lng: number };
}

export const SITE_BASE_URL = 'https://antalyateslimat.com';
export const SITE_NAME = 'Antalya Teslimat';
export const SITE_LOGO_URL = `${SITE_BASE_URL}/app-logo.png`;
export const SITE_PHONE = '+905550007724';
export const SITE_EMAIL = 'kuryeantalyam@gmail.com';
export const SEO_LASTMOD = '2026-11-21';

export const HOME_SEO = {
  path: '/',
  metaTitle: 'Antalya Kurye & Paket Gönderme | Dijital Kurye Platformu',
  metaDescription:
    "Antalya'da çevrenizdeki uygun kuryelere anında ulaşın. Online kurye çağırma, acil kurye ve adresten adrese şehir içi paket gönderme 200 TL sabit fiyatla 7/24.",
  ogTitle: 'Antalya Kurye & Paket Gönderme | Dijital Kurye Platformu',
  ogDescription:
    "Antalya'da çevrenizdeki uygun kuryelere anında ulaşın. Online kurye çağırma, acil kurye ve adresten adrese şehir içi paket gönderme 200 TL sabit fiyatla 7/24.",
};

export const HOME_FAQS: SeoFaqItem[] = [
  {
    question: "Antalya Teslimat klasik bir kurye şirketinden nasıl farklı çalışır?",
    answer:
      "Antalya Teslimat, tek bir çağrı merkezinin sıraya koyduğu klasik bir kurye ofisi değil; göndericilerle çevredeki müsait kuryeleri doğrudan buluşturan dijital bir kurye talep platformudur. Talebinizi oluşturduğunuzda bölgenizdeki aktif kuryeler çağrıyı anında görür ve en uygun konumdaki kurye görevi doğrudan üstlenir.",
  },
  {
    question: "Antalya'da online kurye çağırma ve adresten adrese paket gönderme nasıl yapılır?",
    answer:
      "Kayıtlı kullanıcılar giriş yaparak adreslerini girip taleplerini anında kurye havuzunda yayınlayabilir. Üyelik oluşturmak istemeyen ziyaretçiler ise 7/24 aktif sesli asistan üzerinden adres ve alıcı bilgilerini konuşarak kurye çağrısı başlatabilir.",
  },
  {
    question: "Antalya şehir içi paket gönderme ücreti ne kadardır?",
    answer:
      "Antalya şehir içi standart moto kurye gönderilerinde tüm kategorilerde ve hizmet verilen merkez ilçeler arasında şeffaf 200 TL ücret politikası uygulanır. Ödeme tercihinize göre gönderici ödemeli veya alıcı ödemeli olarak tamamlanır.",
  },
  {
    question: "Acil kurye talebi kaç dakikada adresime ulaşır?",
    answer:
      "Talebiniz havuza düştükten sonra bulunduğunuz mahalleye en yakın müsait kurye tarafından kabul edilir. Muratpaşa, Konyaaltı, Kepez ve Lara hattında ortalama kapıdan kapıya teslimat süresi yoğunluğa bağlı olarak 30 ile 45 dakika arasındadır.",
  },
  {
    question: "Gece saatlerinde veya hafta sonu Antalya'da kurye bulabilir miyim?",
    answer:
      "Evet. Dijital talep havuzu 7 gün 24 saat kesintisiz açıktır. Akşam, gece veya hafta sonu saatlerinde sahada aktif bulunan nöbetçi moto kuryeler talebinizi görerek adresten adrese teslimatı gerçekleştirir.",
  },
  {
    question: "Gönderimin durumunu canlı takip edebilir miyim?",
    answer:
      "Her talep için benzersiz bir takip kodu oluşturulur. Kurye atandığı andan paketin teslim alınmasına ve alıcıya ulaşmasına kadar tüm aşamaları ekranınızdan canlı olarak izleyebilir, gerektiğinde kuryenizle doğrudan iletişim kurabilirsiniz.",
  },
];

export const SEO_PAGES: SeoPageData[] = [
  // =========================================================================
  // 1. SERVICE PAGE: ANTALYA PAKET GÖNDERME
  // =========================================================================
  {
    slug: 'antalya-paket-gonderme',
    path: '/antalya-paket-gonderme',
    category: 'service',
    navLabel: 'Paket Gönderme',
    breadcrumbParent: 'Hizmetler',
    metaTitle: 'Antalya Paket Gönderme | Adresten Adrese Online Kurye Platformu',
    metaDescription:
      "Antalya paket gönderme talebinizi saniyeler içinde yayınlayın. Adresten adrese şehir içi paket teslimatı, çevrenizdeki uygun kuryelerle 200 TL sabit fiyatla.",
    h1: 'Antalya Paket Gönderme — Adresten Adrese Dijital Kurye Ağı',
    kicker: 'Şehir İçi Paket Gönderimi · Adresten Adrese · 200 TL Sabit Ücret',
    lead: "Antalya içinde bir adresten başka bir adrese paket göndermek için kargo şubesine gitmenize veya telefon hattında sıra beklemenize gerek yok. Talebinizi dijital kurye havuzuna bırakın, çevrenizdeki en uygun kurye paketinizi kapınızdan alıp doğrudan alıcıya ulaştırsın.",
    platformAngleTitle: 'Kargo Şubesi Değil, Çevrenizdeki Kuryelere Açık Dijital Talep Havuzu',
    platformAngleBody:
      "Klasik şehir içi kargo süreçlerinde paketiniz önce şubeye gider, aktarma merkezinde bekler ve ertesi gün dağıtıma çıkar. Antalya Teslimat bu süreci tamamen tersine çevirir: Gönderi talebiniz aynı anda bulunduğunuz bölgedeki aktif moto kuryelerin ekranına düşer. Boşta olan en yakın kurye paketi kabul eder, adresinizden teslim alır ve hiçbir aktarma olmadan doğrudan alıcının eline ulaştırır.",
    intentSectionTitle: "Antalya'da Günlük Paket Gönderiminde Şeffaf ve Doğrudan Süreç",
    intentParagraphs: [
      "Evde unutulan bir anahtar, yakınınıza göndermek istediğiniz hediye paketi, mağazadan alınan bir ürün ya da tamirden çıkan kişisel bir cihaz... Gün içinde Antalya'nın bir ucundan diğerine acilen gitmesi gereken gönderiler için saatlerce beklemek yerine dijital platform üzerinden anlık eşleşme sağlayabilirsiniz.",
      "Antalya paket gönderme altyapımızda fiyat sürprizi yaşanmaz. İlçe içi ve ilçeler arası standart moto kurye gönderilerinde 200 TL net ücret uygulanır. İsterseniz ödemeyi kapıda kendiniz yapabilir, isterseniz 'Alıcı Ödemeli' seçeneğiyle tahsilatın teslimat anında alıcıdan alınmasını sağlayabilirsiniz.",
    ],
    scenariosTitle: 'Antalya Paket Gönderme Platformunda En Sık Gönderilen Paketler',
    scenarios: [
      {
        title: 'Kişisel Eşya ve Unutulanlar',
        description:
          "Evde veya ofiste unutulan anahtar, kimlik, şarj aleti, gözlük, çanta ya da kıyafetlerin aynı saat içinde sahibine ulaştırılması.",
      },
      {
        title: 'Hediye, Çiçek ve Özel Gün Paketleri',
        description:
          "Doğum günü hediyesi, butik pasta veya özel ambalajlı kutuların aktarma merkezlerinde sarsılmadan, tek kurye ile doğrudan alıcıya taşınması.",
      },
      {
        title: 'İkinci El Alışveriş & Alıcı Ödemeli Gönderiler',
        description:
          "Antalya içi bireysel satışlarda ürünün satıcı adresinden alınıp alıcıya teslim edilmesi ve kurye ücretinin alıcı tarafından ödenmesi.",
      },
      {
        title: 'E-Ticaret İade ve Mağaza Teslimatları',
        description:
          "Değişim yapılacak kıyafet, ayakkabı veya küçük elektronik ürünlerin şehir içi mağaza ve atölyelere zahmetsizce ulaştırılması.",
      },
    ],
    processTitle: 'Adresten Adrese Paket Gönderme Nasıl İşler?',
    processSteps: [
      {
        number: '01.',
        title: 'Alış ve Teslimat Bilgilerini Girin',
        description:
          "Üyeliğinizle giriş yaparak formu doldurun veya üyeliksiz sesli asistanla gönderici-alıcı ilçe, açık adres ve telefon bilgilerini paylaşın.",
      },
      {
        number: '02.',
        title: 'Çevrenizdeki Kuryeler Talebi Anında Görür',
        description:
          "Kayıtlı üyelerin talepleri doğrudan canlı kurye havuzunda yayınlanır. Size en yakın müsait kurye görevi kabul ettiğinde adı ve telefonu ekranınızda belirir.",
      },
      {
        number: '03.',
        title: 'Kapıdan Alım ve Canlı Takip',
        description:
          "Kurye paketi adresinizden teslim aldığında durum 'Dağıtımda' olarak güncellenir. Takip kodunuzla teslimat tamamlanana kadar her adımı izlersiniz.",
      },
    ],
    highlightsTitle: 'Paket Gönderim Kuralları ve Platform Avantajları',
    highlightsSubtitle: 'Şehir içi moto kurye çantasına uygun tüm gönderilerde net standartlar.',
    highlights: [
      { label: 'Standart Gönderi Ücreti', detail: 'Merkez ilçeler genelinde 200 TL sabit tarife' },
      { label: 'Ödeme Esnekliği', detail: 'Gönderici Ödemeli veya Alıcı Ödemeli seçenek' },
      { label: 'Ortalama Teslim Süresi', detail: 'Aktarmasız doğrudan rota ile 30–45 dakika' },
      { label: 'Çalışma Saatleri', detail: 'Hafta içi, hafta sonu ve gece 7/24 açık talep havuzu' },
      { label: 'Kayıtlı Üye Hızı', detail: 'Kayıtlı müşterilerin talepleri onay beklemeden havuza düşer' },
      { label: 'Kayıt ve Fiş Desteği', detail: 'Üyelikli gönderilerde dijital teslimat fişi ve geçmiş arşivi' },
    ],
    comparisonTitle: 'Klasik Kargo / Telefonla Kurye Yerine Dijital Talep Platformu',
    comparisonPoints: [
      {
        traditional: 'Kargo şubesine gidip sıra beklemek ve ertesi gün teslimatına razı olmak',
        platform: 'Evinizden çıkmadan online talep açıp 30–45 dakikada doğrudan teslimat',
      },
      {
        traditional: 'Telefonla kurye arayıp bölgeye göre değişen belirsiz fiyatlar duymak',
        platform: 'Gönderi öncesi ekranda net 200 TL fiyat ve şeffaf ödeme seçimi',
      },
      {
        traditional: 'Paketin nerede olduğunu öğrenmek için sürekli telefonla aramak',
        platform: 'Atanan kurye bilgisi ve aşama aşama canlı durum takibi',
      },
    ],
    contextualLinks: [
      {
        path: '/antalya-acil-kurye',
        anchor: 'Antalya acil kurye platformu',
        context: 'Dakikaların kritik olduğu acil gönderilerinizde en yakın kuryeyle nasıl eşleştiğinizi inceleyin.',
      },
      {
        path: '/antalya-evrak-gonderme',
        anchor: 'Antalya evrak ve sözleşme gönderme',
        context: 'Islak imzalı belge, noter dosyası ve resmi evrak transferleri için özel detaylara göz atın.',
      },
      {
        path: '/konyaalti-kurye',
        anchor: 'Konyaaltı kurye ağı',
        context: 'Liman, Hurma, Uncalı ve sahil hattından hızlı paket çıkışı yapın.',
      },
      {
        path: '/muratpasa-kurye',
        anchor: 'Muratpaşa şehir içi kurye',
        context: 'Merkez ofisler, Işıklar, Meltem ve Meydankavağı paket teslimat detayları.',
      },
    ],
    faqs: [
      {
        question: "Antalya paket gönderme için moto kurye ile ne büyüklükte paket gönderebilirim?",
        answer:
          "Standart moto kurye taşıma çantasına güvenle sığabilecek tüm paketler (dosya, koli, poşet, hediye kutusu, yedek parça, küçük ev aleti, anahtar ve tekstil ürünleri) adresten adrese taşınabilir.",
      },
      {
        question: "Farklı ilçeler arasında paket gönderdiğimde fiyat değişir mi?",
        answer:
          "Hayır. Muratpaşa, Konyaaltı, Kepez ve Lara dahil hizmet verilen merkez ilçeler arasındaki standart moto kurye gönderilerinde 200 TL sabit fiyat uygulanır.",
      },
      {
        question: "Üyelik açmadan Antalya'da paket gönderebilir miyim?",
        answer:
          "Evet. Ana sayfadaki veya bu sayfadaki 'Üyeliksiz Sesli Kurye Çağır' butonuna dokunarak 7/24 sesli asistanımız üzerinden form doldurmadan paket gönderim kaydı oluşturabilirsiniz.",
      },
      {
        question: "Alıcı evde yoksa veya teslimat sırasında adres değişikliği olursa ne yapılır?",
        answer:
          "Kurye atandığı anda telefon numarası panelinizde görünür. Alıcıya ulaşılamadığı durumlarda kurye gönderici ile doğrudan iletişime geçerek güvenli teslimat teyidi alır.",
      },
    ],
    serviceType: 'Şehir İçi Paket Gönderme Platformu',
    areaServed: ['Antalya', 'Muratpaşa', 'Konyaaltı', 'Kepez', 'Lara'],
  },

  // =========================================================================
  // 2. SERVICE PAGE: ANTALYA ACİL KURYE
  // =========================================================================
  {
    slug: 'antalya-acil-kurye',
    path: '/antalya-acil-kurye',
    category: 'service',
    navLabel: 'Acil Kurye',
    breadcrumbParent: 'Hizmetler',
    metaTitle: 'Antalya Acil Kurye | 7/24 Online Kurye Çağırma Platformu',
    metaDescription:
      "Antalya acil kurye ihtiyacınızda telefonla operatör beklemeyin. Online kurye çağırma havuzu ile çevrenizdeki en yakın müsait kuryeyi dakikalar içinde yönlendirin.",
    h1: 'Antalya Acil Kurye — En Yakın Müsait Kuryeyi Anında Çağırın',
    kicker: '7/24 Acil Gönderi · Anlık Havuz Eşleşmesi · Online Kurye Çağırma',
    lead: "Zamanla yarışan bir gönderiniz olduğunda en büyük kayıp, kurye şirketlerini tek tek arayıp 'şu an müsait motorumuz yok' cevabı almaktır. Antalya Teslimat, talebinizi saniyeler içinde çevrenizdeki tüm aktif kuryelere ulaştırarak bekleme süresini minimuma indirir.",
    platformAngleTitle: 'Neden Acil Durumlarda Dijital Havuz Sistemi Daha Hızlıdır?',
    platformAngleBody:
      "Geleneksel kurye firmalarında sınırlı sayıda kadrolu kurye tek bir merkezden manuel olarak yönlendirilir. O an o bölgedeki kurye doluysa başka bir ilçeden motor gelmesini beklersiniz. Dijital kurye talep platformumuzda ise Antalya'nın farklı mahallelerinde halihazırda hareket halinde olan çok sayıda kurye talebinizi eş zamanlı bildirimle görür. Bulunduğunuz sokağa en yakın kurye görevi tek dokunuşla alır ve doğrudan kapınıza yönelir.",
    intentSectionTitle: "Gece, Hafta Sonu ve Trafik Saatlerinde Kesintisiz Acil Kurye Erişimi",
    intentParagraphs: [
      "Antalya'da özellikle yaz sezonu trafiğinde, akşam iş çıkış saatlerinde veya gece geç saatlerde acil bir paketi kendi aracınızla götürmek hem ciddi zaman kaybı hem de otopark sorunudur. Online kurye çağırma ekranından talebinizi açtığınızda motosikletli kuryeler şehir trafiğine takılmadan en kısa güzergahtan ilerler.",
      "Havalimanı yolcusunun unuttuğu pasaport veya valiz anahtarı, gece acil ihtiyaç duyulan reçeteli ürün, sanayiden beklenen tek bir yedek parça ya da kapanış saatinden önce yetişmesi gereken resmi bir dosya için 7/24 canlı havuz aktif kalır.",
    ],
    scenariosTitle: 'Acil Kurye Çağrısının Hayat Kurtardığı Gerçek Senaryolar',
    scenarios: [
      {
        title: 'Havalimanı ve Otogar Yolcu Unutulanları',
        description:
          "Uçuş veya otobüs saatinden önce evde unutulan pasaport, kimlik, cüzdan veya bilgisayarın hızla yolcuya ulaştırılması.",
      },
      {
        title: 'Gece & Nöbetçi Acil İhtiyaçlar',
        description:
          "Gece saatlerinde evler arasında acil ulaştırılması gereken bebek bakım malzemeleri, medikal ekipman veya kişisel eşyalar.",
      },
      {
        title: 'Kritik İş & Teknik Servis Parçaları',
        description:
          "Durma noktasına gelen bir tamir, klima bakımı veya mağaza operasyonu için gerekli yedek parçanın dakikalar içinde sahaya indirilmesi.",
      },
      {
        title: 'Son Dakika Kapanış Öncesi Yetişen Gönderiler',
        description:
          "Mesai bitimine dakikalar kala banka, adliye, noter veya gümrük noktalarına yetişmesi gereken acil belgeler.",
      },
    ],
    processTitle: 'Saniyeler İçinde Online Acil Kurye Nasıl Çağrılır?',
    processSteps: [
      {
        number: '01.',
        title: 'Hızlı Çağrı Yönteminizi Seçin',
        description:
          "Kayıtlı hesabınızla tek ekrandan talebi anında havuza yayınlayın ya da kayıtla vakit kaybetmeden sesli asistanla konuşarak çağrı açın.",
      },
      {
        number: '02.',
        title: 'Sesli Bildirimle Anlık Kurye Eşleşmesi',
        description:
          "Bölgedeki kuryelerin mobil cihazlarına anında yüksek sesli talep bildirimi gider; en yakın kurye görevi kabul ederek size doğru yola çıkar.",
      },
      {
        number: '03.',
        title: 'Doğrudan İletişim ve Hızlı Teslimat',
        description:
          "Kuryenizin adı ve telefonunu anlık görür, paketin alım ve teslim adımlarını kesintisiz olarak ekranınızdan takip edersiniz.",
      },
    ],
    highlightsTitle: 'Acil Kurye Operasyon Göstergeleri',
    highlightsSubtitle: 'Bekleme süresini azaltan dijital talep altyapısı.',
    highlights: [
      { label: 'Talep Yayınlama Hızı', detail: 'Kayıtlı üyeler için onay beklemeden anında kurye havuzuna düşer' },
      { label: 'Hizmet Saatleri', detail: '7 gün 24 saat, resmi tatil ve gece nöbeti dahil kesintisiz erişim' },
      { label: 'Şehir İçi Ortalama Süre', detail: 'Merkez mahallelerde ortalama 30–45 dakikada teslimat' },
      { label: 'Sabit Ücret Güvencesi', detail: 'Acil çağrılarda gizli gece/mesafe sürprizi olmadan 200 TL net tarife' },
      { label: 'Çoklu Çağrı Desteği', detail: 'Aynı anda birden fazla acil paket için peş peşe talep açabilme' },
      { label: 'Sesli Asistan Alternatifi', detail: 'Yazacak vaktiniz olmadığında 7/24 konuşarak talep oluşturma' },
    ],
    comparisonTitle: 'Acil Gönderilerde Neden Antalya Teslimat Platformu?',
    comparisonPoints: [
      {
        traditional: 'Meşgul telefon hatlarında dakikalarca operatör açmasını beklemek',
        platform: 'Web veya mobilden saniyeler içinde canlı kurye havuzuna doğrudan erişim',
      },
      {
        traditional: 'Sadece tek bir ofisteki müsait kuryeye bağımlı kalmak',
        platform: 'Antalya geneline dağılmış geniş bağımsız kurye ağıyla hızlı eşleşme',
      },
      {
        traditional: 'Acil ibaresi eklenince katlanan ekstra ekspres ücretleri',
        platform: 'Tüm şehir içi standart gönderilerde baştan belli şeffaf ücret',
      },
    ],
    contextualLinks: [
      {
        path: '/antalya-paket-gonderme',
        anchor: 'Antalya adresten adrese paket gönderme',
        context: 'Günlük tüm paket gönderi türleri ve ödeme seçeneklerini inceleyin.',
      },
      {
        path: '/lara-kurye',
        anchor: 'Lara ve Havalimanı hattı kurye',
        context: 'Güzeloba, Fener, Çağlayan ve Kundu oteller hattında hızlı acil kurye erişimi.',
      },
      {
        path: '/kepez-kurye',
        anchor: 'Kepez ve Sanayi acil kurye',
        context: 'Dokuma, Varsak, Kültür ve Akdeniz Sanayi Sitesi acil parça ve paket akışı.',
      },
      {
        path: '/isletmelere-kurye-antalya',
        anchor: 'İşletmeler için anlık kurye havuzu',
        context: 'Yoğun saatlerde işletmenizin acil teslimatlarını sabit maaş yükü olmadan yönetin.',
      },
    ],
    faqs: [
      {
        question: "Antalya'da gece 02:00'de acil kurye çağırabilir miyim?",
        answer:
          "Evet. Dijital platformumuz 7/24 açıktır ve gece saatlerinde nöbetçi olarak aktif bulunan moto kuryeler havuzdaki acil talepleri bildirimle görüp kabul edebilir.",
      },
      {
        question: "Kurye talebimi oluşturduktan sonra iptal etmem gerekirse ne olur?",
        answer:
          "Aktif sipariş takip ekranınız üzerinden kurye atanmadan önce veya özel durumlarda iptal işlemini tek tıkla gerçekleştirebilirsiniz; iptal bilgisi havuzdan ve kurye ekranından anında güncellenir.",
      },
      {
        question: "Acil kurye çağırdığımda kurye kapıya kaç dakikada gelir?",
        answer:
          "Konumunuza en yakın müsait kurye talebi kabul ettikten sonra genellikle 10 ile 20 dakika içinde alış adresinize ulaşır. Toplam teslimat süresi mesafeye göre ortalama 30–45 dakikadır.",
      },
      {
        question: "Acil gönderi için ekstra ücret öder miyim?",
        answer:
          "Standart moto kurye taşıma sınırları içindeki şehir içi gönderilerde acil diye ek gizli tarife uygulanmaz; sistemde gördüğünüz 200 TL şeffaf ücret geçerlidir.",
      },
    ],
    serviceType: '7/24 Acil Kurye Talep Platformu',
    areaServed: ['Antalya', 'Muratpaşa', 'Konyaaltı', 'Kepez', 'Lara'],
  },

  // =========================================================================
  // 3. SERVICE PAGE: ANTALYA EVRAK GÖNDERME
  // =========================================================================
  {
    slug: 'antalya-evrak-gonderme',
    path: '/antalya-evrak-gonderme',
    category: 'service',
    navLabel: 'Evrak Gönderme',
    breadcrumbParent: 'Hizmetler',
    metaTitle: 'Antalya Evrak Gönderme | Güvenli Dosya & Sözleşme Kurye Ağı',
    metaDescription:
      "Antalya'da ıslak imzalı sözleşme, noter, muhasebe, adliye ve ihale evraklarınızı elden ele güvenle ulaştırın. Online kurye çağırma ile 30-45 dakikada teslim.",
    h1: 'Antalya Evrak Gönderme — Elden Ele Güvenli Belge Transferi',
    kicker: 'Islak İmzalı Sözleşme · Noter & Adliye · Muhasebe & Ofis Evrakı',
    lead: "Dijitalleşen dünyada bile pek çok ticari sözleşme, vekaletname, ihale dosyası ve muhasebe evrakı hâlâ ıslak imza gerektirir. Antalya Teslimat platformu ile evraklarınızı zarf içinde doğrudan alıcının kendisine ulaştıracak güvenilir moto kuryeyi dakikalar içinde bulabilirsiniz.",
    platformAngleTitle: 'Kayıp ve Karışma Riski Olmayan Doğrudan Kurye Eşleşmesi',
    platformAngleBody:
      "Standart kargo ağlarında ince bir evrak zarfı onlarca paketle birlikte aktarma bantlarından geçer, kaybolma veya yanlış şubeye gitme riski taşır. Antalya Teslimat üzerinden evrak gönderdiğinizde, belgeniz alış ofisinden teslim alan kuryenin çantasında tek parça halinde taşınır ve ara depo görmeden doğrudan hedef ofisteki yetkili kişiye elden teslim edilir.",
    intentSectionTitle: "Hukuk Büroları, Mali Müşavirler ve Kurumsal Ofisler İçin Hızlı Belge Trafiği",
    intentParagraphs: [
      "Antalya'da özellikle Meltem'deki Adliye çevresi, Muratpaşa'daki noterler, bankalar, tapu ve belediye birimleri ile Konyaaltı ve Lara'daki ofisler arasında gün içinde yoğun bir belge akışı bulunur. Personelinizi trafiğe çıkarıp yarım gün kaybetmek yerine, dijital talep havuzu üzerinden birkaç saniyede kurye yönlendirebilirsiniz.",
      "Kayıtlı kullanıcı olarak gönderdiğiniz tüm evrak taleplerinde geçmiş kayıtlarınıza ve teslimat fişlerinize dilediğiniz zaman ulaşabilir, hangi belgenin saat kaçta kime teslim edildiğini şeffaf biçimde arşivleyebilirsiniz.",
    ],
    scenariosTitle: 'Antalya Evrak Gönderme Platformunda En Çok Kullanılan Belge Türleri',
    scenarios: [
      {
        title: 'Hukuk & Adliye Dosyaları',
        description:
          "Avukatlık büroları ile Meltem Adliye, icra daireleri veya müvekkil adresleri arasında gün içi yetişmesi gereken dilekçe ve vekaletnameler.",
      },
      {
        title: 'Mali Müşavirlik, Fatura ve Vergi Evrakları',
        description:
          "Ay sonu beyanname dönemlerinde işletmelerden muhasebe ofislerine ulaştırılması gereken klasör, fatura ve resmi evraklar.",
      },
      {
        title: 'Emlak, Tapu ve Kira Sözleşmeleri',
        description:
          "Farklı ilçelerdeki alıcı, satıcı veya emlak danışmanları arasında ıslak imza için dolaşması gereken kira ve satış protokolleri.",
      },
      {
        title: 'İhale, Banka ve Üniversite Belgeleri',
        description:
          "Akdeniz Üniversitesi, bankalar veya kamu kurumlarına mesai bitmeden teslim edilmesi gereken kapalı zarf başvuru dosyaları.",
      },
    ],
    processTitle: 'Güvenli Evrak Gönderimi 3 Adımda Nasıl Tamamlanır?',
    processSteps: [
      {
        number: '01.',
        title: 'Evrak Kategorisini ve Alıcı Yetkiliyi Belirtin',
        description:
          "Gönderi türünde evrak/belge seçeneğini işaretleyip teslim alacak kişinin adını, ofis/kat bilgisini ve telefonunu eksiksiz girin.",
      },
      {
        number: '02.',
        title: 'Kurye Ataması ve Kimlik Şeffaflığı',
        description:
          "Talebinizi üstlenen kayıtlı kuryenin adı ve iletişim numarası ekranınıza düşer; evrakı kapalı zarf halinde doğrudan kuryeye teslim edersiniz.",
      },
      {
        number: '03.',
        title: 'Elden Teslim ve Dijital Kayıt',
        description:
          "Kurye belgeyi belirttiğiniz alıcıya ulaştırdığında sipariş 'Teslim Edildi' olarak kapanır ve kayıtlı hesabınızda teslimat fişi oluşur.",
      },
    ],
    highlightsTitle: 'Evrak Transferinde Güvenlik ve İzlenebilirlik Standartları',
    highlightsSubtitle: 'Hassas belgeleriniz için öngörülebilir şehir içi dağıtım deneyimi.',
    highlights: [
      { label: 'Aktarmasız Elden Teslim', detail: 'Evrakınız başka bir araca veya depoya aktarılmaz' },
      { label: 'Kayıtlı Kurye Havuzu', detail: 'Sadece platforma kayıtlı ve iletişim bilgisi görünür kuryeler görev alır' },
      { label: 'Teslimat Fişi & Arşiv', detail: 'Üyelikli hesaplarda geçmiş evrak gönderimleri ve fişler saklanır' },
      { label: 'Noter & Mesai Uyumu', detail: 'Saat 17:00 kapanışından önce yetişen hızlı şehir içi rota' },
      { label: 'Sabit Ekonomik Maliyet', detail: 'İlçeler arası evrak gönderiminde net 200 TL ücret' },
      { label: 'Alıcı Ödemeli Seçenek', detail: 'Karşı tarafın ödeyeceği belge gönderimlerinde kapıda tahsilat' },
    ],
    comparisonTitle: 'Ofis Personeli Göndermek Yerine Dijital Evrak Kurye Ağı',
    comparisonPoints: [
      {
        traditional: 'Ofis çalışanının trafik ve otoparkta 1,5 saat kaybetmesi',
        platform: 'Kendi işiniz bölünmeden 200 TL sabit ücretle 30–45 dakikada teslimat',
      },
      {
        traditional: 'Kargo ile gönderilen evrakın ertesi güne kalması veya şubede beklemesi',
        platform: 'Aynı saat içinde elden ele doğrudan alıcı masasına ulaşım',
      },
      {
        traditional: 'Evrakın ulaşıp ulaşmadığını telefonla teyit etmeye çalışmak',
        platform: 'Anlık takip kodu ve teslim edildi bildirimiyle net kayıt',
      },
    ],
    contextualLinks: [
      {
        path: '/muratpasa-kurye',
        anchor: 'Muratpaşa & Meltem Adliye kurye ağı',
        context: 'Adliye, kamu kurumları ve merkez noterler çevresindeki yoğun evrak hattını inceleyin.',
      },
      {
        path: '/isletmelere-kurye-antalya',
        anchor: 'İşletmeler ve ofisler için kurye platformu',
        context: 'Düzenli evrak ve dosya trafiği olan ofisler için çoklu talep avantajlarını keşfedin.',
      },
      {
        path: '/antalya-acil-kurye',
        anchor: 'Son dakika acil kurye çağır',
        context: 'Mesai bitimine dakikalar kala yetişmesi gereken acil belgeler için anında eşleşme.',
      },
      {
        path: '/konyaalti-kurye',
        anchor: 'Konyaaltı ofis ve site evrak teslimatı',
        context: 'Konyaaltı bölgesindeki ofisler, emlak büroları ve siteler arası hızlı belge taşıma.',
      },
    ],
    faqs: [
      {
        question: "Antalya'da imzalı sözleşmeyi karşı tarafa gönderip tekrar geri getirtebilir miyim?",
        answer:
          "Evet. İlk teslimat tamamlandıktan sonra dönüş yönü için yeni bir talep oluşturabilir veya sipariş notunda evrakın imzalanıp geri döneceğini belirterek kurye ile koordinasyon sağlayabilirsiniz.",
      },
      {
        question: "Evrak gönderiminde belgenin gizliliği nasıl korunur?",
        answer:
          "Evraklarınızı kapalı zarf veya korumalı dosya içinde teslim etmeniz önerilir. Kurye belgeyi ara depoya bırakmadan, doğrudan belirttiğiniz alıcı ismine elden ulaştırır.",
      },
      {
        question: "Meltem Adliye veya Muratpaşa noterlerinden Konyaaltı ve Lara'ya kaç dakikada evrak gider?",
        answer:
          "Muratpaşa merkezden Konyaaltı veya Lara yönüne moto kuryeler trafik yoğunluğuna takılmadan ilerlediği için evraklarınız ortalama 30–45 dakikada alıcısına ulaşır.",
      },
      {
        question: "Hukuk büromuz veya muhasebe ofisimiz düzenli evrak çıkışı için üye olabilir mi?",
        answer:
          "Evet. Ücretsiz müşteri üyeliği oluşturduğunuzda adresleriniz kayıtlı kalır, girdiğiniz tüm evrak talepleri yönetici onayına takılmadan anında kurye havuzuna düşer ve geçmiş fişlerinize her zaman erişebilirsiniz.",
      },
    ],
    serviceType: 'Evrak ve Sözleşme Gönderme Platformu',
    areaServed: ['Antalya', 'Muratpaşa', 'Konyaaltı', 'Kepez', 'Lara'],
  },

  // =========================================================================
  // 4. SERVICE PAGE: İŞLETMELERE KURYE ANTALYA
  // =========================================================================
  {
    slug: 'isletmelere-kurye-antalya',
    path: '/isletmelere-kurye-antalya',
    category: 'service',
    navLabel: 'İşletmelere',
    breadcrumbParent: 'Hizmetler',
    metaTitle: 'İşletmelere Kurye Antalya | Esnek Dijital Kurye Talep Ağı',
    metaDescription:
      "Antalya'daki işletmeler için sabit maaş ve motor maliyeti olmadan anlık kurye havuzu. E-ticaret, butik, optik, eczane ve ofis gönderilerinizde 200 TL sabit ücret.",
    h1: 'İşletmelere Kurye Antalya — Sabit Maliyetsiz Dijital Teslimat Altyapısı',
    kicker: 'E-Ticaret · Butik & Mağaza · Optik & Medikal · Ofis & Tedarik',
    lead: "Antalya'da büyüyen bir işletme için kadrolu kurye istihdam etmek, motosiklet bakımı, yakıt ve sigorta yükünü taşımak her zaman verimli değildir. Antalya Teslimat, yalnızca gönderiniz olduğunda çevrenizdeki aktif kuryelere ulaşmanızı sağlayan esnek dijital kurye talep platformudur.",
    platformAngleTitle: 'Kendi Kurye Filonuzu Kurmadan Dakikalar İçinde Teslimat Gücü',
    platformAngleBody:
      "İşletme hesabınızla sisteme giriş yaptığınızda girdiğiniz paket talepleri onay kuyruğunda beklemeden doğrudan canlı kurye havuzunda yayınlanır. Yoğun indirim günlerinde, aynı saat içinde 5 farklı müşterinize sipariş çıkarmanız gerektiğinde tek bir kuryenin dönmesini beklemezsiniz; bölgedeki birden fazla kurye siparişlerinizi eş zamanlı olarak üstlenip müşterilerinize ulaştırır.",
    intentSectionTitle: "Antalya'nın Yerel Ticaretine Uyarlanmış Esnek Gönderi Modeli",
    intentParagraphs: [
      "Instagram ve WhatsApp üzerinden satış yapan Antalya butikleri, gün içi gözlük veya lens yetiştiren optikçiler, diş protez laboratuvarları, çiçekçiler, oto yedek parça tedarikçileri ve yerel pastaneler için teslimat hızı doğrudan müşteri memnuniyetini belirler.",
      "Alıcı ödemeli gönderi desteği sayesinde müşterinizin kapıda teslimat ücretini doğrudan kuryeye ödemesini sağlayabilir, ya da gönderici ödemeli seçeneğiyle kendi sabit maliyetinizi 200 TL üzerinden net olarak hesaplayabilirsiniz. Her tamamlanan teslimatın geçmiş kaydı ve dijital fişi müşteri panelinizde düzenli olarak saklanır.",
    ],
    scenariosTitle: 'Antalya Teslimat Platformunu Kullanan Başlıca İşletme Grupları',
    scenarios: [
      {
        title: 'Butikler, Çiçekçiler ve Yerel E-Ticaret Mağazaları',
        description:
          "Antalya içi aynı gün teslimat sözü vererek online satış dönüşümünü artırmak isteyen giyim, kozmetik, çiçek ve hediyelik mağazaları.",
      },
      {
        title: 'Optik, Medikal, Diş Laboratuvarları ve Klinikler',
        description:
          "Klinikler, hastaneler ve laboratuvarlar arasında gün içinde hassas ölçü, protez, reçeteli gözlük ve medikal malzeme transferi.",
      },
      {
        title: 'Oto Yedek Parça, Teknik Servis ve Sanayi Tedarikçileri',
        description:
          "Akdeniz Sanayi veya Yeni Sanayi'den şehir içindeki servislere ve ustalara dakikalar içinde parça ulaştırarak iş kaybını önleme.",
      },
      {
        title: 'Emlak, Turizm Acenteleri ve Kurumsal Ofisler',
        description:
          "Otel misafirlerine bilet/pasaport/hediye ulaştırma, ofisler arası sözleşme dolaşımı ve şube içi malzeme tedariki.",
      },
    ],
    processTitle: 'İşletmeniz İçin Dijital Kurye Havuzunu Kullanmaya Başlayın',
    processSteps: [
      {
        number: '01.',
        title: 'Ücretsiz İşletme / Müşteri Üyeliği Oluşturun',
        description:
          "İşletme iletişim ve adres bilgilerinizle bir kez kayıt olun; sabit abonelik ücreti veya aylık taahhüt bulunmaz.",
      },
      {
        number: '02.',
        title: 'Taleplerinizi Doğrudan Havuza Yayınlayın',
        description:
          "Kayıtlı hesapların oluşturduğu gönderiler yönetici onayı beklemeden saniyeler içinde Antalya genelindeki kurye havuzuna düşer.",
      },
      {
        number: '03.',
        title: 'Çoklu Siparişleri Canlı Takip ve Fişle Yönetin',
        description:
          "Aynı anda birden fazla aktif teslimatın durumunu tek ekrandan izleyin, teslimat geçmişinizi ve fişlerinizi arşivleyin.",
      },
    ],
    highlightsTitle: 'İşletmelere Özel Platform Kazanımları',
    highlightsSubtitle: 'Sadece kullandığınız kadar ödeyin, teslimat hızınızla rekabette öne geçin.',
    highlights: [
      { label: 'Sıfır Sabit Gider', detail: 'Aylık abonelik, maaş, SGK veya yakıt maliyeti yok' },
      { label: 'Anında Havuza Yayın', detail: 'Kayıtlı işletme talepleri doğrudan kuryelerin ekranına düşer' },
      { label: 'Öngörülebilir Maliyet', detail: 'Merkez ilçeler genelinde paket başına 200 TL sabit tarife' },
      { label: 'Eş Zamanlı Çoklu Dağıtım', detail: 'Yoğun saatlerde aynı anda birden fazla kurye çağırabilme' },
      { label: 'Alıcı Ödemeli Esneklik', detail: 'Teslimat ücretini doğrudan alıcı müşterinizden tahsil etme seçeneği' },
      { label: 'Geçmiş & Fiş Arşivi', detail: 'Tamamlanan tüm işletme gönderilerini tarih ve takip koduyla arama' },
    ],
    comparisonTitle: 'Kadrolu Kurye İstihdamı vs. Dijital Kurye Talep Platformu',
    comparisonPoints: [
      {
        traditional: 'Gönderi olmasa bile aylık sabit maaş, motor bakım ve yakıt gideri ödemek',
        platform: 'Yalnızca gerçekten paket gönderdiğinizde 200 TL birim maliyetle çalışmak',
      },
      {
        traditional: 'Tek kurye hastalandığında veya yoğunlukta tüm teslimatların aksaması',
        platform: 'Antalya geneline yayılan aktif kurye havuzuyla kesintisiz kapasite',
      },
      {
        traditional: 'Müşteriye kuryenin nerede olduğu bilgisini verememek',
        platform: 'Takip kodu ve atanan kurye bilgisiyle profesyonel müşteri deneyimi',
      },
    ],
    contextualLinks: [
      {
        path: '/antalya-evrak-gonderme',
        anchor: 'Kurumsal evrak ve sözleşme kuryesi',
        context: 'Ofisler, hukuk ve muhasebe birimleri için elden ele belge transferi.',
      },
      {
        path: '/kepez-kurye',
        anchor: 'Kepez & Akdeniz Sanayi kurye ağı',
        context: 'Sanayi, depo ve toptan ticaret noktalarından şehir geneline hızlı çıkış.',
      },
      {
        path: '/lara-kurye',
        anchor: 'Lara butik, klinik ve otel teslimatları',
        context: 'Lara, Fener, Çağlayan ve Kundu hattındaki işletmelerin hızlı dağıtım çözümü.',
      },
      {
        path: '/antalya-paket-gonderme',
        anchor: 'Adresten adrese paket gönderme rehberi',
        context: 'Standart paket koşulları ve teslimat akışının tüm detayları.',
      },
    ],
    faqs: [
      {
        question: "İşletme olarak sisteme katılmak için aylık minimum gönderi şartı var mı?",
        answer:
          "Hayır. Aylık abonelik, taahhüt veya minimum paket kotası yoktur. İster haftada 2 paket, ister günde 20 paket gönderin; yalnızca oluşturduğunuz teslimatlar kadar ödeme yaparsınız.",
      },
      {
        question: "Aynı anda birden fazla müşterime paket çıkarmak istersem nasıl çalışır?",
        answer:
          "Kayıtlı müşteri panelinizden peş peşe birden fazla paket talebi oluşturabilirsiniz. Her talep anında havuza düşer; aynı rota üzerindeki uygun bir kurye veya farklı kuryeler siparişlerinizi hızla üstlenir.",
      },
      {
        question: "İşletmelerin oluşturduğu talepler neden daha hızlı kuryeye ulaşır?",
        answer:
          "Kayıtlı müşteri hesaplarından web paneli üzerinden girilen gönderiler yönetici onay adımına takılmadan doğrudan canlı kurye havuzunda yayınlanır, böylece ekstra bekleme süresi oluşmaz.",
      },
      {
        question: "Müşterime teslimat ücretini kapıda ödetebilir miyim?",
        answer:
          "Evet. Sipariş oluştururken 'Alıcı Ödemeli' seçeneğini işaretlediğinizde kuryemiz paketi teslim ederken 200 TL teslimat ücretini doğrudan alıcıdan tahsil eder.",
      },
    ],
    serviceType: 'İşletmelere Yönelik Dijital Kurye Platformu',
    areaServed: ['Antalya', 'Muratpaşa', 'Konyaaltı', 'Kepez', 'Lara'],
  },

  // =========================================================================
  // 5. DISTRICT PAGE: KONYAALTI KURYE
  // =========================================================================
  {
    slug: 'konyaalti-kurye',
    path: '/konyaalti-kurye',
    category: 'district',
    navLabel: 'Konyaaltı Kurye',
    breadcrumbParent: 'Antalya Bölgeleri',
    metaTitle: 'Konyaaltı Kurye | Liman, Hurma, Uncalı Online Kurye Platformu',
    metaDescription:
      "Konyaaltı kurye çağır: Liman, Hurma, Uncalı, Gürsu, Altınkum ve Arapsuyu'nda çevrenizdeki uygun moto kuryelere anında ulaşın. 7/24 200 TL sabit fiyatla teslimat.",
    h1: 'Konyaaltı Kurye — Liman, Hurma ve Uncalı Çevresindeki Kuryelere Anında Ulaşın',
    kicker: 'Konyaaltı Yerel Kurye Ağı · Sahil & İç Mahalleler · 7/24 Aktif Havuz',
    lead: "Konyaaltı'nın geniş site yerleşimleri, sahil bandı ve yaz sezonunda yoğunlaşan bulvar trafiğinde aracınızla paket yetiştirmek zahmetlidir. Antalya Teslimat dijital kurye havuzu ile Liman'dan Uncalı'ya, Hurma'dan Muratpaşa veya Lara'ya çevrenizdeki en yakın müsait kuryeyi dakikalar içinde çağırın.",
    platformAngleTitle: "Konyaaltı Mahallelerinde Halihazırda Sahada Olan Kuryelerle Eşleşin",
    platformAngleBody:
      "Konyaaltı hem yerleşik aile sitelerinin, hem uluslararası sakinlerin hem de sahil boyunca sıralanan kafe, klinik ve ofislerin yoğunlaştığı dinamik bir ilçedir. Merkezden kurye beklemek yerine dijital talep havuzumuz sayesinde zaten Liman, Hurma, Altınkum veya Uncalı aksında bulunan müsait kuryeler çağrınızı anında görür ve kapınıza ulaşır.",
    intentSectionTitle: "Atatürk Bulvarı, Gazi Mustafa Kemal Bulvarı ve Sahil Hattında Kesintisiz Akış",
    intentParagraphs: [
      "Özellikle yaz aylarında Konyaaltı Sahili, Arapsuyu ve Gürsu çevresinde araç trafiği ve park yeri bulma süresi ciddi oranda artar. Moto kurye ağı sayesinde site güvenlik kapılarından teslim alınıp bırakılan paketleriniz trafik düğümlerine takılmadan ilerler.",
      "Konyaaltı içindeki iki mahalle arasında (örneğin Hurma'dan Uncalı'ya) olduğu gibi, Konyaaltı'ndan Akdeniz Üniversitesi, Meltem Adliye, MarkAntalya veya Lara yönüne giden tüm standart paketlerde 200 TL sabit tarife geçerlidir.",
    ],
    scenariosTitle: "Konyaaltı'nda En Sık Kullanılan Kurye Rotaları ve İhtiyaçlar",
    scenarios: [
      {
        title: 'Liman & Hurma Siteleri Günlük Gönderileri',
        description:
          "Geniş site yerleşimlerinden şehir merkezine unutulan anahtar, evrak, kişisel paket ve alıcı ödemeli ürün çıkışları.",
      },
      {
        title: 'Uncalı, Molla Yusuf & Toros Ofis ve Klinik Hattı',
        description:
          "Özel klinikler, emlak ofisleri ve konut projeleri arasında gün içi sözleşme, medikal ürün ve dosya transferleri.",
      },
      {
        title: 'Gürsu, Altınkum & Arapsuyu Sahil İşletmeleri',
        description:
          "Sahil şeridindeki kafe, butik, otel ve konaklama tesislerinin acil tedarik ve misafir paket ulaştırmaları.",
      },
      {
        title: 'Sarısu ve Çevre Bağlantı Teslimatları',
        description:
          "Batı aksındaki konut ve iş yerlerinden şehir merkezine veya Kepez-Muratpaşa ilçelerine aktarmasız moto kurye erişimi.",
      },
    ],
    processTitle: "Konyaaltı'nda Online Kurye Çağırma Adımları",
    processSteps: [
      {
        number: '01.',
        title: 'Konyaaltı Alış Adresinizi ve Site Bilgisini Girin',
        description:
          "Mahalle, site/blok adı ve alıcı adresini üyelikli formdan veya üyeliksiz 7/24 sesli asistandan saniyeler içinde paylaşın.",
      },
      {
        number: '02.',
        title: 'Konyaaltı Çevresindeki Kurye Talebi Üstlenir',
        description:
          "Talebiniz havuzda yayınlandığında bölgedeki en yakın müsait kurye görevi kabul eder; kurye bilgisi anında ekranınızda görünür.",
      },
      {
        number: '03.',
        title: 'Site Kapısından Teslim Alım ve Canlı Takip',
        description:
          "Paketiniz adresinizden alınarak ilçe içi veya diğer Antalya ilçelerindeki hedef adrese ortalama 30–45 dakikada ulaştırılır.",
      },
    ],
    highlightsTitle: 'Konyaaltı Kapsama Mahalleleri ve Ulaşım Noktaları',
    highlightsSubtitle: 'Konyaaltı genelinde aktif kurye talebi oluşturabileceğiniz başlıca bölgeler.',
    highlights: [
      { label: 'Liman & Hurma', detail: 'Site yoğunluklu batı yerleşim bölgesinde hızlı kapıdan alım' },
      { label: 'Uncalı & Molla Yusuf', detail: 'Ofis, klinik ve konut aksında gün boyu aktif kurye havuzu' },
      { label: 'Gürsu & Altınkum', detail: 'Sahil trafiğine takılmayan ekspres moto kurye yönlendirmesi' },
      { label: 'Arapsuyu & Toros', detail: 'Akdeniz Üniversitesi ve merkez bağlantı koridorunda hızlı geçiş' },
      { label: 'Öğretmenevleri & Pınarbaşı', detail: 'Atatürk Bulvarı boyunca evrak ve acil paket transferi' },
      { label: 'Sarısu & Boğaçayı Çevresi', detail: 'Batı ucundan şehir merkezine 200 TL sabit ücretli gönderim' },
    ],
    comparisonTitle: "Konyaaltı'nda Neden Antalya Teslimat Dijital Havuzu?",
    comparisonPoints: [
      {
        traditional: 'Merkez Muratpaşa’dan kurye gelmesini bekleyip 1 saat kaybetmek',
        platform: 'Konyaaltı içinde zaten aktif olan en yakın kuryeyle doğrudan eşleşmek',
      },
      {
        traditional: 'Hurma veya Sarısu gibi uç mahallelerde ekstra mesafe farkı ödemek',
        platform: 'Konyaaltı’ndan tüm merkez ilçelere şeffaf 200 TL standart tarife',
      },
      {
        traditional: 'Akşam ve hafta sonu açık kurye ofisi bulamamak',
        platform: '7/24 açık dijital talep havuzu ve sesli çağrı kolaylığı',
      },
    ],
    contextualLinks: [
      {
        path: '/muratpasa-kurye',
        anchor: 'Konyaaltı – Muratpaşa kurye hattı',
        context: 'Konyaaltı’ndan Meltem, Işıklar, MarkAntalya ve merkez ofislere hızlı geçiş.',
      },
      {
        path: '/kepez-kurye',
        anchor: 'Konyaaltı – Kepez kurye bağlantısı',
        context: 'Uncalı ve Arapsuyu üzerinden Kültür, Dokuma ve Sanayi yönüne paket gönderimi.',
      },
      {
        path: '/antalya-paket-gonderme',
        anchor: 'Antalya adresten adrese paket gönderme',
        context: 'Alıcı ödemeli gönderi ve standart paket kurallarının tüm detayları.',
      },
      {
        path: '/antalya-acil-kurye',
        anchor: '7/24 acil kurye çağır',
        context: 'Gece veya hafta sonu acil gönderilerinizde anlık kurye yönlendirmesi.',
      },
    ],
    faqs: [
      {
        question: "Konyaaltı Hurma veya Liman'dan Lara'ya paket gönderme ücreti ne kadar?",
        answer:
          "Konyaaltı'nın Liman, Hurma, Uncalı gibi mahallelerinden Lara, Muratpaşa veya Kepez yönüne yapılan standart moto kurye gönderilerinde 200 TL sabit ücret uygulanır.",
      },
      {
        question: "Konyaaltı'nda site güvenliğine paket bırakma veya güvenlikten paket aldırma yapılıyor mu?",
        answer:
          "Evet. Sipariş adres detayında site adı, blok bilgisi ve güvenlik teslimat notunu paylaştığınızda kuryemiz sizinle veya alıcıyla teyitleşerek işlemi sorunsuz tamamlar.",
      },
      {
        question: "Konyaaltı içinde akşam saatlerinde kurye bulabilir miyim?",
        answer:
          "Evet. Dijital kurye havuzumuz 7/24 açıktır. Akşam ve gece saatlerinde Konyaaltı çevresinde aktif olan nöbetçi kuryeler talebinizi görerek teslimatı üstlenir.",
      },
      {
        question: "Konyaaltı'ndan diğer ilçelere alıcı ödemeli paket gönderebilir miyim?",
        answer:
          "Evet. Sipariş oluştururken 'Alıcı Ödemeli' seçeneğini işaretlediğinizde Konyaaltı'ndan Muratpaşa, Kepez veya Lara'ya gönderilen paketin 200 TL teslimat ücreti teslimat anında doğrudan alıcıdan tahsil edilir.",
      },
    ],
    serviceType: 'Konyaaltı Dijital Kurye Talep Platformu',
    areaServed: ['Konyaaltı', 'Liman', 'Hurma', 'Uncalı', 'Gürsu', 'Altınkum', 'Arapsuyu', 'Sarısu', 'Antalya'],
    geoCenter: { lat: 36.8685, lng: 30.6352 },
  },

  // =========================================================================
  // 6. DISTRICT PAGE: KEPEZ KURYE
  // =========================================================================
  {
    slug: 'kepez-kurye',
    path: '/kepez-kurye',
    category: 'district',
    navLabel: 'Kepez Kurye',
    breadcrumbParent: 'Antalya Bölgeleri',
    metaTitle: 'Kepez Kurye | Dokuma, Varsak, Kültür & Sanayi Kurye Platformu',
    metaDescription:
      "Kepez kurye çağır: Dokuma, Kültür, Varsak, Gülveren ve Akdeniz Sanayi'de çevrenizdeki uygun kuryeleri anında bulun. 7/24 online paket ve parça gönderimi 200 TL.",
    h1: 'Kepez Kurye — Dokuma, Kültür, Varsak ve Sanayi Dijital Kurye Ağı',
    kicker: 'Kepez Yerel Kurye Ağı · Sanayi, Üniversite & Konut Hattı · 7/24',
    lead: "Antalya'nın en geniş nüfuslu ve ticari hareketliliği yüksek ilçesi Kepez'de sanayi yedek parçasından öğrenci paketine, hastane evrakından e-ticaret siparişine kadar her gönderi için çevrenizdeki uygun kuryeyi dijital platform üzerinden hızla çağırın.",
    platformAngleTitle: "Kepez'in Geniş Coğrafyasında Bölgeye Hakim Aktif Kuryeler",
    platformAngleBody:
      "Kepez; Kültür'deki üniversite yoğunluğunu, Dokuma ve Özdilek çevresindeki şehir merkezine yakın ticari hattı, Akdeniz ve Yeni Sanayi Siteleri'ndeki teknik parça trafiğini ve Varsak'a uzanan geniş konut alanlarını tek ilçede barındırır. Antalya Teslimat, talebinizi Kepez genelindeki aktif kurye havuzunda anında yayınlayarak doğru bölgedeki kuryenin görevi üstlenmesini sağlar.",
    intentSectionTitle: "Sanayi Sitesi Parça Trafiği, Kültür Öğrenci Gönderileri ve Hastane Hattı",
    intentParagraphs: [
      "Akdeniz Sanayi Sitesi ve Yeni Sanayi'de çalışan ustalar, yedek parçacılar ve teknik servisler için tek bir parçanın müşteri adresine veya başka bir atölyeye dakikalar içinde ulaşması iş akışının kesilmemesi demektir. Sabit 200 TL tarife ile personel göndermeden anında moto kurye çıkarabilirsiniz.",
      "Öte yandan Kültür, Gülveren ve Fabrikalar mahallelerindeki üniversite öğrencileri, ofisler ve aileler için Muratpaşa veya Konyaaltı yönüne giden günlük paket ve evraklar Gazi Bulvarı ve Dumlupınar Bulvarı koridorlarından hızla teslim edilir.",
    ],
    scenariosTitle: "Kepez'de En Sık Karşılaşılan Kurye Talepleri",
    scenarios: [
      {
        title: 'Akdeniz Sanayi & Yeni Sanayi Yedek Parça Transferi',
        description:
          "Oto yedek parça, elektrik-elektronik malzeme, tesisat parçası ve teknik ekipmanların Antalya genelindeki servislere hızla ulaştırılması.",
      },
      {
        title: 'Kültür, Gülveren & Üniversite Çevresi Gönderileri',
        description:
          "Öğrenci evleri, yurtlar ve kampüs çevresinden anahtar, kitap, dosya, laptop şarjı veya kişisel paketlerin hızlı teslimatı.",
      },
      {
        title: 'Dokuma, Özdilek & Fabrikalar Ticari Akışı',
        description:
          "İş merkezleri, mağazalar, matbaalar ve depolardan şehir içi müşterilere gün içi paket ve numune gönderimleri.",
      },
      {
        title: 'Varsak, Sütçüler & Hastane Bölgesi Teslimatları',
        description:
          "Kepez Devlet Hastanesi ve Antalya Şehir Hastanesi aksındaki konutlara ve birimlere evrak, kişisel ihtiyaç ve paket ulaştırma.",
      },
    ],
    processTitle: "Kepez'den Online Kurye Çağırma Süreci",
    processSteps: [
      {
        number: '01.',
        title: 'Alış Noktasını ve Paket Türünü Belirtin',
        description:
          "Kepez mahalle/sanayi blok bilgisini ve teslimat adresini üyelikli panelden ya da üyeliksiz sesli asistandan iletin.",
      },
      {
        number: '02.',
        title: 'En Yakın Kepez Kuryesi Talebi Kabul Eder',
        description:
          "Canlı havuzdaki bildirimi gören en uygun kurye görevi alır; kurye adı ve telefon numarası ekranınızda anında görünür.",
      },
      {
        number: '03.',
        title: 'Hızlı Alım ve Antalya Geneline Doğrudan Teslimat',
        description:
          "Paketiniz dükkân, atölye veya ev kapınızdan teslim alınır ve Kepez içi ya da diğer ilçelere aktarmasız ulaştırılır.",
      },
    ],
    highlightsTitle: 'Kepez Aktif Kurye Bölgeleri ve Koridorlar',
    highlightsSubtitle: 'Kepez’in ticaret, sanayi ve yerleşim odaklarının tamamında online talep.',
    highlights: [
      { label: 'Dokuma & Fabrikalar', detail: 'Özdilek, Erasta ve merkezi ticaret hattında hızlı alım' },
      { label: 'Kültür & Gülveren', detail: 'Akdeniz Üniversitesi ve öğrenci yerleşimlerinde 7/24 kurye' },
      { label: 'Akdeniz & Yeni Sanayi', detail: 'Atölye ve yedek parça işletmeleri için acil parça kuryesi' },
      { label: 'Varsak & Karşıyaka', detail: 'Kuzey yerleşimlerinden merkeze 200 TL sabit ücretli gönderim' },
      { label: 'Yeni Doğan & Ahatlı', detail: 'Dumlupınar Bulvarı bağlantılı hızlı şehir içi paket trafiği' },
      { label: 'Sütçüler & Şehir Hastanesi Aksı', detail: 'Sağlık kampüsü ve çevre mahallelere kesintisiz erişim' },
    ],
    comparisonTitle: "Kepez İşletmeleri ve Sakinleri İçin Dijital Havuz Farkı",
    comparisonPoints: [
      {
        traditional: 'Sanayi veya Varsak için “uzak bölge” bahanesiyle yüksek fiyat çıkması',
        platform: 'Kepez genelinden tüm merkez ilçelere 200 TL şeffaf standart ücret',
      },
      {
        traditional: 'Parça yetiştirmek için dükkândan bir ustanın veya çırağın ayrılması',
        platform: 'Ekibiniz işinin başında kalırken çevredeki müsait kuryenin teslimatı yapması',
      },
      {
        traditional: 'Telefonla adres tarif ederken karışıklık yaşanması',
        platform: 'Yazılı adres kaydı, takip kodu ve kuryeyle doğrudan iletişim',
      },
    ],
    contextualLinks: [
      {
        path: '/isletmelere-kurye-antalya',
        anchor: 'Sanayi ve işletmeler için kurye platformu',
        context: 'Düzenli parça, ürün ve evrak çıkışı yapan Kepez işletmeleri için çoklu talep avantajı.',
      },
      {
        path: '/konyaalti-kurye',
        anchor: 'Kepez – Konyaaltı kurye hattı',
        context: 'Kültür ve Gülveren’den Konyaaltı Uncalı, Liman ve Hurma’ya hızlı geçiş.',
      },
      {
        path: '/muratpasa-kurye',
        anchor: 'Kepez – Muratpaşa şehir içi kurye',
        context: 'Dokuma ve Sanayi’den Muratpaşa merkez ofis ve mağazalarına doğrudan teslimat.',
      },
      {
        path: '/antalya-acil-kurye',
        anchor: 'Antalya acil kurye çağırma',
        context: 'Acil yedek parça ve zaman kritik gönderilerde anlık kurye eşleşmesi.',
      },
    ],
    faqs: [
      {
        question: "Kepez Akdeniz Sanayi Sitesi'nden Lara veya Konyaaltı'na yedek parça gönderebilir miyim?",
        answer:
          "Evet. Moto kurye çantasına veya bagajına güvenle sığabilen tüm oto, makine, elektrik ve tesisat yedek parçalarını Akdeniz Sanayi'den Antalya'nın diğer merkez ilçelerine 200 TL sabit ücretle gönderebilirsiniz.",
      },
      {
        question: "Varsak veya Sütçüler mahallesine de aynı sistem üzerinden kurye çağırabilir miyim?",
        answer:
          "Evet. Kepez ilçesini seçip açık mahalle/sokak adresinizi girdiğinizde talebiniz doğrudan canlı kurye havuzuna iletilir ve müsait kurye tarafından kabul edilir.",
      },
      {
        question: "Kültür mahallesinde öğrenciyim; üyeliksiz kurye çağırabilir miyim?",
        answer:
          "Evet. Üyelik oluşturmak istemiyorsanız 7/24 Sesli Kurye Asistanı butonuna basarak yalnızca adres ve telefon bilgilerinizi söyleyerek kurye talebi açabilirsiniz.",
      },
      {
        question: "Kepez'deki işletmemiz günde birkaç kez kurye çağırdığında fiş alabilir mi?",
        answer:
          "Üyelikli müşteri hesabınızla oluşturduğunuz her teslimat için dijital teslimat fişi ve tarih bazlı geçmiş kaydı panelinizde otomatik olarak saklanır.",
      },
    ],
    serviceType: 'Kepez Dijital Kurye Talep Platformu',
    areaServed: ['Kepez', 'Dokuma', 'Kültür', 'Varsak', 'Gülveren', 'Fabrikalar', 'Akdeniz Sanayi', 'Antalya'],
    geoCenter: { lat: 36.9235, lng: 30.7136 },
  },

  // =========================================================================
  // 7. DISTRICT PAGE: MURATPAŞA KURYE
  // =========================================================================
  {
    slug: 'muratpasa-kurye',
    path: '/muratpasa-kurye',
    category: 'district',
    navLabel: 'Muratpaşa Kurye',
    breadcrumbParent: 'Antalya Bölgeleri',
    metaTitle: 'Muratpaşa Kurye | Meltem, Işıklar & Merkez Online Kurye Ağı',
    metaDescription:
      "Muratpaşa kurye çağır: Işıklar, Meltem, Meydankavağı, Kızılarık, Şirinyalı ve merkez ofislerde çevrenizdeki uygun kuryelere anında ulaşın. 7/24 200 TL teslimat.",
    h1: 'Muratpaşa Kurye — Antalya Merkezde Trafiğe Takılmayan Dijital Kurye Ağı',
    kicker: 'Muratpaşa Yerel Kurye Ağı · İş Merkezi, Adliye & Çarşı · 7/24',
    lead: "Antalya'nın ticari, hukuki ve idari kalbi Muratpaşa'da gün içi otopark ve bulvar trafiği en basit teslimatı bile saatlik bir çileye dönüştürebilir. Antalya Teslimat dijital kurye platformu ile Işıklar'dan Meltem'e, Meydankavağı'ndan Konyaaltı ve Kepez'e çevrenizdeki en yakın kuryeyi anında yönlendirin.",
    platformAngleTitle: "Muratpaşa'nın En Yoğun Caddelerinde Anlık Kurye Yoğunluğu",
    platformAngleBody:
      "Yüzüncü Yıl Bulvarı, Tonguç Caddesi, Işıklar, MarkAntalya çevresi, Şarampol ve Meltem'deki kamu kurumları gün boyunca en yüksek kurye hareketliliğinin yaşandığı bölgelerdir. Dijital havuz yapımız sayesinde bu aksta halihazırda görev tamamlayan veya müsait bekleyen kuryeler talebinizi saniyeler içinde görür ve araç trafiğine takılmadan paketinizi teslim alır.",
    intentSectionTitle: "Ofisler, Kamu Kurumları, Çarşı Esnafı ve Merkez Konutlar İçin Hızlı Çözüm",
    intentParagraphs: [
      "Meltem'de bulunan Antalya Adliyesi, Eğitim ve Araştırma Hastanesi, belediye ve kamu müdürlükleri ile merkezdeki hukuk, muhasebe ve gümrük ofisleri arasında gün içinde acil evrak trafiği hiç durmaz. Aynı şekilde Kaleiçi çevresi, Kazım Özalp Caddesi ve Şirinyalı'daki mağazalar için hızlı ürün ulaştırma kritik önem taşır.",
      "Muratpaşa içindeki kısa mesafeli ofis geçişlerinden Konyaaltı, Kepez veya Lara'ya uzanan teslimatlara kadar tüm standart moto kurye taleplerinde tek ve şeffaf 200 TL ücretle güvenle gönderim yapabilirsiniz.",
    ],
    scenariosTitle: "Muratpaşa'da Dijital Kurye Platformunun En Çok Kullanıldığı Alanlar",
    scenarios: [
      {
        title: 'Meltem Adliye, Hastane ve Kamu Kurumları Evrak Hattı',
        description:
          "Avukatlık büroları, mali müşavirler ve vatandaşlar için mesai saatleri içinde hızla yetişmesi gereken dosya ve belgeler.",
      },
      {
        title: 'Işıklar, MarkAntalya & Merkez Mağaza Teslimatları',
        description:
          "Çarşı ve cadde mağazalarından, optikçilerden, kuyumcu/aksesuar butiklerinden müşteri adreslerine aynı saat içinde teslimat.",
      },
      {
        title: 'Meydankavağı, Kızılarık & Kırcami Konut ve İş Yerleri',
        description:
          "Yoğun yerleşim ve iş yerlerinin kesiştiği doğu-merkez hattında günlük paket, anahtar, hediye ve alıcı ödemeli gönderiler.",
      },
      {
        title: 'Şirinyalı, Yenikapı & Kaleiçi Sınır Teslimatları',
        description:
          "Otomobil girişinin kısıtlı veya otoparkın imkânsız olduğu bölgelerde motosikletli kuryelerle pratik kapı teslimatı.",
      },
    ],
    processTitle: "Muratpaşa'da Dakikalar İçinde Kurye Çağırma",
    processSteps: [
      {
        number: '01.',
        title: 'Ofis veya Ev Adresinizden Talep Oluşturun',
        description:
          "Üyeliğinizle giriş yapıp adresinizi seçin veya üyeliksiz 7/24 sesli asistan üzerinden Muratpaşa alış ve teslimat bilgilerini paylaşın.",
      },
      {
        number: '02.',
        title: 'Merkezdeki En Yakın Kurye Görevi Alır',
        description:
          "Muratpaşa çevresinde aktif olan müsait kuryelerden biri çağrınızı saniyeler içinde kabul ederek adresinize yönelir.",
      },
      {
        number: '03.',
        title: 'Trafik Kaybı Olmadan Teslim ve Takip',
        description:
          "Kurye paketinizi teslim aldığında durum canlı olarak güncellenir ve alıcıya ulaşana kadar takip kodunuzla süreci izlersiniz.",
      },
    ],
    highlightsTitle: 'Muratpaşa Hizmet Odakları ve Merkezi Noktalar',
    highlightsSubtitle: 'Antalya merkezinin her mahallesinde günün her saati erişilebilir talep ağı.',
    highlights: [
      { label: 'Meltem & Bahçelievler', detail: 'Adliye, hastane ve ofisler arası öncelikli evrak & paket hattı' },
      { label: 'Işıklar & Şirinyalı', detail: 'Cadde mağazaları, klinikler ve apartmanlara hızlı kurye' },
      { label: 'MarkAntalya & Şarampol', detail: 'Trafik ve park sorununa takılmayan esnaf ve ofis teslimatları' },
      { label: 'Meydankavağı & Kızılarık', detail: 'Doğu merkez mahallelerinden tüm Antalya’ya aktarmasız erişim' },
      { label: 'Kızılsaray & Muratpaşa Çarşı', detail: 'Noter, banka ve muhasebe büroları için elden belge transferi' },
      { label: 'Konuksever & Etiler', detail: 'Çevreyolu bağlantısıyla Kepez ve Lara yönüne 30–45 dk teslim' },
    ],
    comparisonTitle: "Muratpaşa Trafiğinde Neden Dijital Kurye Talep Platformu?",
    comparisonPoints: [
      {
        traditional: 'Merkezde araçla 40 dakika otopark arayıp iş zamanını kaybetmek',
        platform: 'Motosikletli kuryeyi kapınıza çağırıp 200 TL’ye gönderiyi halletmek',
      },
      {
        traditional: 'Telefonla aranan kurye ofisinin “merkez çok yoğun, 2 saat sürer” demesi',
        platform: 'Canlı havuzdaki çok sayıda müsait kuryeden en hızlısıyla eşleşmek',
      },
      {
        traditional: 'Birden fazla evrak veya müşteri paketini sırayla bekletmek',
        platform: 'Aynı anda birden fazla talebi havuza açıp eş zamanlı dağıtım yapmak',
      },
    ],
    contextualLinks: [
      {
        path: '/antalya-evrak-gonderme',
        anchor: 'Antalya evrak ve sözleşme gönderme',
        context: 'Meltem Adliye, noter ve merkez ofisler arası güvenli belge transferi detayları.',
      },
      {
        path: '/lara-kurye',
        anchor: 'Muratpaşa – Lara sahil hattı kurye',
        context: 'Şirinyalı üzerinden Fener, Çağlayan, Güzeloba ve Kundu yönüne kesintisiz teslimat.',
      },
      {
        path: '/konyaalti-kurye',
        anchor: 'Muratpaşa – Konyaaltı kurye bağlantısı',
        context: 'Meltem ve Bahçelievler’den Konyaaltı mahallelerine dakikalar içinde geçiş.',
      },
      {
        path: '/isletmelere-kurye-antalya',
        anchor: 'Merkez işletmeler için dijital kurye ağı',
        context: 'Mağaza, eczane, optik ve ofisler için sabit maliyetsiz kurye çözümü.',
      },
    ],
    faqs: [
      {
        question: "Muratpaşa Meltem Adliye çevresinden acil dosya göndermek ne kadar sürer?",
        answer:
          "Muratpaşa merkezde aktif kurye yoğunluğu yüksektir. Talebiniz kabul edildikten sonra ortalama 10–15 dakikada alış sağlanır ve Antalya merkez ilçelerine toplam 30–45 dakikada teslim edilir.",
      },
      {
        question: "Kaleiçi veya araç trafiğine kapalı caddelere teslimat yapılabiliyor mu?",
        answer:
          "Evet. Araç girişinin kısıtlı olduğu Kaleiçi ve yaya yollarında kuryemiz en yakın giriş noktasına kadar motoruyla gelir, alıcıyla telefonla teyitleşerek elden teslimatı tamamlar.",
      },
      {
        question: "Muratpaşa içindeki kısa mesafeli gönderi ile diğer ilçeye gönderi arasında fiyat farkı var mı?",
        answer:
          "Hayır. Muratpaşa içi ve Muratpaşa'dan Konyaaltı, Kepez veya Lara'ya yapılan tüm standart moto kurye gönderilerinde şeffaf 200 TL sabit ücret uygulanır.",
      },
      {
        question: "Ofisimizden gün içinde 3-4 farklı adrese evrak göndermek için ayrı ayrı mı çağrı açmalıyız?",
        answer:
          "Evet, her farklı teslimat adresi için ayrı talep oluşturduğunuzda her birinin kendi takip kodu ve teslimat fişi olur; müsait kuryeler tüm gönderilerinizi hızla eş zamanlı dağıtabilir.",
      },
    ],
    serviceType: 'Muratpaşa Dijital Kurye Talep Platformu',
    areaServed: ['Muratpaşa', 'Meltem', 'Işıklar', 'Meydankavağı', 'Şirinyalı', 'Kızılarık', 'Antalya'],
    geoCenter: { lat: 36.8841, lng: 30.7056 },
  },

  // =========================================================================
  // 8. DISTRICT PAGE: LARA KURYE
  // =========================================================================
  {
    slug: 'lara-kurye',
    path: '/lara-kurye',
    category: 'district',
    navLabel: 'Lara Kurye',
    breadcrumbParent: 'Antalya Bölgeleri',
    metaTitle: 'Lara Kurye | Fener, Güzeloba, Çağlayan & Kundu Kurye Platformu',
    metaDescription:
      "Lara kurye çağır: Fener, Çağlayan, Güzeloba, Barınaklar ve Kundu oteller hattında çevrenizdeki uygun kuryelere anında ulaşın. 7/24 online paket gönderme 200 TL.",
    h1: 'Lara Kurye — Fener, Çağlayan, Güzeloba ve Kundu Hızlı Kurye Platformu',
    kicker: 'Lara Yerel Kurye Ağı · Fener, Güzeloba & Oteller Hattı · 7/24',
    lead: "Fener'den Barınaklar Bulvarı'na, Güzeloba'dan Kundu oteller bölgesine ve Antalya Havalimanı güzergahına uzanan Lara hattında acil paket, klinik gönderisi veya otel misafir teslimatı için çevrenizdeki müsait kuryelere tek platformdan ulaşın.",
    platformAngleTitle: "Lara'nın Dinamik Yaşam ve Turizm Koridorunda Anlık Kurye Erişimi",
    platformAngleBody:
      "Lara; estetik ve diş klinikleri, seçkin butikler, restoranlar, rezidanslar ve Kundu'daki beş yıldızlı otelleriyle Antalya'nın en yüksek hizmet beklentisine sahip bölgesidir. Antalya Teslimat, talebinizi Lara ve çevresinde aktif olan kuryelerin ekranına anında ileterek hem bölge içi hem de şehir merkezine uzanan teslimatları bekletmeden çözer.",
    intentSectionTitle: "Barınaklar Bulvarı, Lara Caddesi, Güzeloba ve Havalimanı Hattında Dakik Teslimat",
    intentParagraphs: [
      "Lara bölgesinde faaliyet gösteren diş klinikleri, laboratuvarlar, butikler, emlak danışmanlıkları ve turizm acenteleri için hız ve güvenilirlik esastır. Otel misafirinin unuttuğu bir eşyanın havalimanına ya da başka bir otele yetiştirilmesi, ya da bir kliniğin acil numune/belgesinin merkeze ulaştırılması dijital havuz üzerinden dakikalar içinde koordine edilir.",
      "Fener, Çağlayan ve Güzeloba arasındaki kısa geçişlerde olduğu gibi, Lara'dan Konyaaltı, Kepez veya Muratpaşa merkezine giden standart gönderilerde de şeffaf 200 TL sabit tarife ve alıcı/gönderici ödeme seçenekleri sunulur.",
    ],
    scenariosTitle: "Lara Bölgesinde En Sık Gerçekleşen Kurye Gönderileri",
    scenarios: [
      {
        title: 'Klinikler, Diş Laboratuvarları ve Sağlık Merkezleri',
        description:
          "Lara Caddesi ve Fener çevresindeki özel kliniklerden laboratuvarlara veya hastalara hızlı ölçü, rapor ve medikal paket transferi.",
      },
      {
        title: 'Kundu Otelleri & Havalimanı Yakın Çevre Teslimatları',
        description:
          "Otel resepsiyonlarına bırakılacak misafir eşyaları, acente belgeleri, pasaport/bilet zarfları ve acil tedarik paketleri.",
      },
      {
        title: 'Butik, Çiçekçi ve Özel Hediyelik Gönderimleri',
        description:
          "Terracity, Barınaklar ve Fener çevresindeki mağazalardan Lara sitelerine veya diğer Antalya ilçelerine özenli aynı gün teslimat.",
      },
      {
        title: 'Güzeloba & Çağlayan Site ve Konut İhtiyaçları',
        description:
          "Günlük unutulan anahtar, evrak, kişisel eşya ve gece nöbetçi acil paket çağrılarının kapıdan kapıya ulaştırılması.",
      },
    ],
    processTitle: "Lara'da Online Kurye Çağırma Nasıl Çalışır?",
    processSteps: [
      {
        number: '01.',
        title: 'Lara Mahalle ve Teslimat Bilgilerini Girin',
        description:
          "Fener, Çağlayan, Güzeloba veya Kundu adres bilgilerinizi üyelikli hızlı formdan ya da üyeliksiz 7/24 sesli asistandan iletin.",
      },
      {
        number: '02.',
        title: 'Lara Çevresindeki Müsait Kurye Talebi Üstlenir',
        description:
          "Canlı havuzdaki bildirimi gören en yakın kurye görevi kabul eder; adı ve telefon bilgisi anlık takip kartınızda belirir.",
      },
      {
        number: '03.',
        title: 'Kapıdan veya Resepsiyondan Teslim ve Canlı İzleme',
        description:
          "Kurye paketi alır, doğrudan hedef adrese ulaştırır; süreç boyunca takip kodunuzla her adımı canlı görürsünüz.",
      },
    ],
    highlightsTitle: 'Lara Aktif Kapsama Noktaları ve Ulaşım Hatları',
    highlightsSubtitle: 'Lara sahilinden havalimanı ve Kundu yönüne uzanan kesintisiz kurye ağı.',
    highlights: [
      { label: 'Fener & Terracity Çevresi', detail: 'Klinik, mağaza ve iş merkezleri için yoğun gün içi kurye akışı' },
      { label: 'Çağlayan & Barınaklar Bulvarı', detail: 'Rezidanslar, kafeler ve ofisler arası 30–45 dk hızlı teslimat' },
      { label: 'Güzeloba & Lara Caddesi', detail: 'Konut siteleri ve havalimanı bağlantısında 7/24 açık talep havuzu' },
      { label: 'Kundu & Kemerağzı Oteller Hattı', detail: 'Resepsiyon ve acente teslimatlarında pratik doğrudan koordinasyon' },
      { label: 'Ermenek & Yeşilbahçe Bağlantısı', detail: 'Muratpaşa merkez ile Lara arasında kesintisiz geçiş' },
      { label: 'Sabit 200 TL Tarife', detail: 'Lara’dan Konyaaltı, Kepez ve Muratpaşa’ya gizli ücret olmadan gönderim' },
    ],
    comparisonTitle: "Lara'da Klasik Kurye Yerine Dijital Talep Platformu",
    comparisonPoints: [
      {
        traditional: 'Turistik bölge ve mesafe gerekçesiyle yüksek özel kurye tarifeleri',
        platform: 'Antalya merkez ilçeleriyle eşdeğer 200 TL şeffaf standart ücret',
      },
      {
        traditional: 'Otel veya klinik resepsiyonunda kuryenin ne zaman geleceğini bilememek',
        platform: 'Atanan kurye telefonu ve anlık aşama takibiyle dakik koordinasyon',
      },
      {
        traditional: 'Akşam ve pazar günleri Lara hattında açık kurye bulamamak',
        platform: '7/24 aktif dijital havuz ve üyeliksiz sesli çağrı desteği',
      },
    ],
    contextualLinks: [
      {
        path: '/muratpasa-kurye',
        anchor: 'Lara – Muratpaşa merkez kurye hattı',
        context: 'Fener ve Yeşilbahçe üzerinden Işıklar, Meltem ve merkez ofislere hızlı teslimat.',
      },
      {
        path: '/konyaalti-kurye',
        anchor: 'Lara – Konyaaltı çapraz şehir içi teslimat',
        context: 'Lara’dan Konyaaltı sahil ve sitelerine sabit ücretle aktarmasız paket gönderimi.',
      },
      {
        path: '/isletmelere-kurye-antalya',
        anchor: 'Lara klinikleri, butikler ve oteller için kurye',
        context: 'İşletmelerin sabit gider olmadan aynı gün teslimat kapasitesi kazanması.',
      },
      {
        path: '/antalya-acil-kurye',
        anchor: 'Havalimanı ve acil gönderi kuryesi',
        context: 'Uçuş öncesi unutulan evrak veya pasaport gibi zaman kritik çağrılar.',
      },
    ],
    faqs: [
      {
        question: "Lara Güzeloba veya Fener'den Konyaaltı'na paket göndermek ne kadar sürer?",
        answer:
          "Antalya'nın iki sahil ucu olan Lara ile Konyaaltı arasında moto kuryeler şehir trafiğine takılmadan ilerlediği için standart paketler ortalama 35–45 dakikada alıcısına ulaşır.",
      },
      {
        question: "Kundu otellerindeki resepsiyona veya bir misafire paket bırakabilir miyim?",
        answer:
          "Evet. Alıcı kısmına otel adını, misafir veya resepsiyon yetkili adını ve iletişim telefonunu yazdığınızda kuryemiz teslimatı doğrudan teyitli şekilde gerçekleştirir.",
      },
      {
        question: "Lara'daki kliniğimiz veya mağazamız için alıcı ödemeli gönderi yapabilir miyiz?",
        answer:
          "Evet. Sipariş formunda 'Alıcı Ödemeli' seçeneğini işaretlediğinizde teslimat ücreti paketi teslim alan müşterinizden tahsil edilir.",
      },
      {
        question: "Lara'da gece geç saatte acil kurye çağırabilir miyim?",
        answer:
          "Evet. 7/24 çalışan dijital talep havuzumuz sayesinde gece saatlerinde de Lara ve çevre mahallelerdeki nöbetçi kuryelere anında çağrı gönderebilirsiniz.",
      },
    ],
    serviceType: 'Lara Dijital Kurye Talep Platformu',
    areaServed: ['Lara', 'Fener', 'Çağlayan', 'Güzeloba', 'Barınaklar', 'Kundu', 'Muratpaşa', 'Antalya'],
    geoCenter: { lat: 36.8548, lng: 30.7852 },
  },
];

export const SERVICE_SEO_PAGES = SEO_PAGES.filter((p) => p.category === 'service');
export const DISTRICT_SEO_PAGES = SEO_PAGES.filter((p) => p.category === 'district');

export function normalizePathname(pathname: string): string {
  if (!pathname) return '/';
  const cleaned = pathname.toLowerCase().trim().replace(/\/+$/, '');
  return cleaned === '' ? '/' : cleaned;
}

export function getSeoPageByPath(pathname: string): SeoPageData | null {
  const normalized = normalizePathname(pathname);
  return SEO_PAGES.find((page) => page.path === normalized) || null;
}

export function buildHomeJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_BASE_URL}/#website`,
        name: SITE_NAME,
        alternateName: [
          'Antalya Teslimat 7/24',
          'Antalya Kurye Talep Platformu',
          'Antalya Şehir İçi Teslimat',
          'Antalya Kurye',
        ],
        url: `${SITE_BASE_URL}/`,
        inLanguage: 'tr-TR',
        description: HOME_SEO.metaDescription,
        publisher: {
          '@id': `${SITE_BASE_URL}/#organization`,
        },
      },
      {
        '@type': 'Organization',
        '@id': `${SITE_BASE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: ['Antalya Teslimat 7/24', 'Antalya Dijital Kurye Talep Platformu'],
        url: `${SITE_BASE_URL}/`,
        logo: {
          '@type': 'ImageObject',
          url: SITE_LOGO_URL,
          width: 512,
          height: 512,
        },
        image: SITE_LOGO_URL,
        description:
          "Antalya'da göndericilerle çevredeki uygun kuryeleri anında buluşturan 7/24 dijital kurye talep platformu.",
        telephone: SITE_PHONE,
        email: SITE_EMAIL,
        areaServed: [
          { '@type': 'City', name: 'Antalya' },
          { '@type': 'AdministrativeArea', name: 'Konyaaltı' },
          { '@type': 'AdministrativeArea', name: 'Kepez' },
          { '@type': 'AdministrativeArea', name: 'Muratpaşa' },
          { '@type': 'AdministrativeArea', name: 'Lara' },
        ],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Antalya',
          addressRegion: 'Antalya',
          postalCode: '07100',
          addressCountry: 'TR',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: SITE_PHONE,
          email: SITE_EMAIL,
          contactType: 'customer service',
          areaServed: 'TR',
          availableLanguage: ['Turkish'],
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${SITE_BASE_URL}/#platform`,
        name: 'Antalya Teslimat — Dijital Kurye Talep Platformu',
        url: `${SITE_BASE_URL}/`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        inLanguage: 'tr-TR',
        description:
          "Antalya'da çevrenizdeki uygun moto kuryelere anında talep yayınlayabileceğiniz, canlı takip ve alıcı/gönderici ödeme destekli online kurye çağırma platformu.",
        provider: {
          '@id': `${SITE_BASE_URL}/#organization`,
        },
        offers: {
          '@type': 'Offer',
          price: '200',
          priceCurrency: 'TRY',
          availability: 'https://schema.org/InStock',
          description: 'Antalya şehir içi standart moto kurye gönderi ücreti',
        },
      },
      {
        '@type': 'Service',
        '@id': `${SITE_BASE_URL}/#service`,
        name: 'Antalya Online Kurye Çağırma ve Paket Gönderme Platformu',
        serviceType: 'Dijital Kurye Talep Platformu',
        provider: {
          '@id': `${SITE_BASE_URL}/#organization`,
        },
        areaServed: [
          { '@type': 'City', name: 'Antalya' },
          { '@type': 'AdministrativeArea', name: 'Konyaaltı' },
          { '@type': 'AdministrativeArea', name: 'Kepez' },
          { '@type': 'AdministrativeArea', name: 'Muratpaşa' },
          { '@type': 'AdministrativeArea', name: 'Lara' },
        ],
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: `${SITE_BASE_URL}/`,
          servicePhone: SITE_PHONE,
          availableLanguage: 'Turkish',
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Antalya Dijital Kurye Talep Hizmetleri',
          itemListElement: SERVICE_SEO_PAGES.map((s) => ({
            '@type': 'Offer',
            url: `${SITE_BASE_URL}${s.path}`,
            price: '200',
            priceCurrency: 'TRY',
            itemOffered: {
              '@type': 'Service',
              name: s.h1,
              description: s.metaDescription,
              url: `${SITE_BASE_URL}${s.path}`,
            },
          })),
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_BASE_URL}/#faq`,
        mainEntity: HOME_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}

export function buildSeoPageJsonLd(page: SeoPageData): Record<string, unknown> {
  const fullUrl = `${SITE_BASE_URL}${page.path}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${fullUrl}#webpage`,
        url: fullUrl,
        name: page.metaTitle,
        description: page.metaDescription,
        inLanguage: 'tr-TR',
        isPartOf: {
          '@id': `${SITE_BASE_URL}/#website`,
        },
        about: {
          '@id': `${fullUrl}#service`,
        },
        breadcrumb: {
          '@id': `${fullUrl}#breadcrumb`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${fullUrl}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Ana Sayfa',
            item: `${SITE_BASE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.navLabel,
            item: fullUrl,
          },
        ],
      },
      {
        '@type': 'Service',
        '@id': `${fullUrl}#service`,
        name: page.h1,
        serviceType: page.serviceType,
        description: page.metaDescription,
        url: fullUrl,
        provider: {
          '@type': 'Organization',
          '@id': `${SITE_BASE_URL}/#organization`,
          name: SITE_NAME,
          url: `${SITE_BASE_URL}/`,
          logo: SITE_LOGO_URL,
          telephone: SITE_PHONE,
        },
        areaServed: page.areaServed.map((area) => ({
          '@type': area === 'Antalya' ? 'City' : 'AdministrativeArea',
          name: area,
        })),
        offers: {
          '@type': 'Offer',
          price: '200',
          priceCurrency: 'TRY',
          availability: 'https://schema.org/InStock',
          url: fullUrl,
          description: `${page.navLabel} — Antalya şehir içi sabit gönderi ücreti`,
        },
      },
      {
        '@type': 'FAQPage',
        '@id': `${fullUrl}#faq`,
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ],
  };
}
