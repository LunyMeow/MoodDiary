# MoodDiary 📝✨

MoodDiary, React ve Firebase kullanılarak geliştirilmiş, kullanıcıların duygularını ve günlüklerini kolayca kaydedip yönetebileceği modern bir web uygulamasıdır.

### Özellikler:

* Kullanıcı kaydı ve güvenli oturum açma 🔐
* Kişisel profil bilgilerini (kullanıcı adı, tam ad, şifre) güncelleyebilme 🧑‍💻
* Günlük ekleme, düzenleme ve silme işlemleri 🗒️
* Günlük verileri veritabanına şifrelenmiş olarak saklanır 🔑
* Profil fotoğrafı yükleme ve varsayılan fotoğraf kullanımı 📸
* Firebase Firestore ve Storage ile hızlı ve güvenilir veri yönetimi ☁️

### Teknolojiler:

* **Frontend:** React, Tailwind CSS
* **Backend & Veri:** Firebase Authentication, Firestore, Firebase Storage

MoodDiary, kullanıcı deneyimini ön planda tutarak, temiz ve kullanıcı dostu bir arayüz sunar. Ayrıca veri güvenliği için Firebase’in güçlü kimlik doğrulama ve erişim kontrol mekanizmalarını kullanır.

### Kurulum:
* functions içindeki buildApis_example.ps1 dosyasının içindeki boş alanları api bilgileriniz ile doldurun
* Komutlar:
```bash
cd functions
npm install
firebase login
firebase init functions
buildApis.ps1
firebase deploy --only functions
```
* Daha sonra verilen Functions linkini services.js klasörünün içindeki link yerine kopyalayın

<img src="https://raw.githubusercontent.com/LunyMeow/MoodDiary/refs/heads/main/ScreenShots/2.png"></img>


<img src="https://raw.githubusercontent.com/LunyMeow/MoodDiary/refs/heads/main/ScreenShots/3.png"></img>
<img src="https://raw.githubusercontent.com/LunyMeow/MoodDiary/refs/heads/main/ScreenShots/4.png"></img>
<img src="https://raw.githubusercontent.com/LunyMeow/MoodDiary/refs/heads/main/ScreenShots/5.png"></img>


Diğer Resimler:
[Ekran Görüntüsü](ScreenShots/1.png)



