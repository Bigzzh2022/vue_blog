import { defineStore } from 'pinia'

export interface StaticPage {
  id: number
  title: string
  slug: string
  content: string
  css: string
  javascript: string
  status: 'published' | 'draft'
  createTime: string
  updateTime: string
  description: string
  keywords: string
  isHome: boolean
  template: string
}

interface PagesState {
  pages: StaticPage[]
  loaded: boolean
}

export const usePagesStore = defineStore('pages', {
  state: (): PagesState => ({
    pages: [],
    loaded: false
  }),
  
  getters: {
    // 获取所有已发布页面
    publishedPages: (state) => {
      return state.pages.filter(page => page.status === 'published')
    },
    
    // 获取所有草稿页面
    draftPages: (state) => {
      return state.pages.filter(page => page.status === 'draft')
    },
    
    // 根据slug获取页面
    getPageBySlug: (state) => {
      return (slug: string) => state.pages.find(page => page.slug === slug)
    },
    
    // 获取首页
    homePage: (state) => {
      return state.pages.find(page => page.isHome)
    }
  },
  
  actions: {
    // 加载页面数据
    async loadPages() {
      try {
        // 从本地存储获取
        const storedPages = localStorage.getItem('staticPages')
        if (storedPages) {
          this.pages = JSON.parse(storedPages)
        } else {
          // 默认创建一个"关于"页面
          this.pages = [
            {
              id: 1,
              title: '关于我',
              slug: 'about',
              content: '<h1>关于我</h1><p>这是一个关于页面，您可以在这里介绍自己。</p>',
              css: 'h1 { color: #333; }\np { line-height: 1.6; }',
              javascript: 'console.log("关于页面已加载");',
              status: 'published',
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
              description: '关于我的介绍',
              keywords: '关于,介绍',
              isHome: false,
              template: 'default'
            },
            {
              id: 999,
              title: '服务条款',
              slug: 'terms-of-service',
              content: `<div class="terms-container">
  <h1>渐开线的小窝 - 服务条款</h1>
  <p class="last-updated">最后更新日期：2023年12月15日</p>
  
  <section class="terms-section">
    <h2>1. 接受条款</h2>
    <p>欢迎使用渐开线的小窝("我们"、"本站")。本网站由渐开线的小窝团队提供。通过访问或使用我们的服务，您同意这些服务条款。如果您不同意这些条款的任何部分，请勿使用我们的服务。</p>
  </section>
  
  <section class="terms-section">
    <h2>2. 服务描述</h2>
    <p>渐开线的小窝是一个博客平台，允许用户阅读文章、发表评论、管理个人账户等。我们可能会不时地更改、添加或删除功能，或完全暂停或停止某项服务。</p>
  </section>
  
  <section class="terms-section">
    <h2>3. 用户账户</h2>
    <p>要使用本站的某些功能，您需要创建一个账户并提供某些个人信息。您承诺提供准确、完整和最新的信息。您有责任保护您的账户安全，包括保密您的密码。</p>
    <p>您同意不与任何第三方共享您的账户和密码，并且对您账户下发生的所有活动负全部责任，无论这些活动是否得到您的授权。</p>
  </section>
  
  <section class="terms-section">
    <h2>4. 用户行为</h2>
    <p>使用我们的服务时，您同意不会：</p>
    <ul>
      <li>违反任何适用的法律或法规</li>
      <li>发布、上传或分享非法、有害、威胁、滥用、骚扰、诽谤、冒犯、侵犯隐私、淫秽或其他不当内容</li>
      <li>冒充他人或虚假陈述您与任何个人或实体的关系</li>
      <li>未经授权收集其他用户的个人信息</li>
      <li>攻击、干扰或破坏服务或与服务连接的任何系统</li>
      <li>在未经我们明确许可的情况下，爬取或复制我们平台上的内容</li>
    </ul>
  </section>
  
  <section class="terms-section">
    <h2>5. 知识产权</h2>
    <p>我们的服务和其中的所有内容、功能和特性（包括但不限于所有信息、软件、文本、显示、图像、视频和音频，以及它们的设计、选择和排列）均为我们或我们的许可方拥有，并受国际著作权、商标、专利、商业秘密和其他知识产权或所有权法律的保护。</p>
    <p>您发布的内容仍然归您所有，但您授予我们全球性、非排他性、免版税的许可，允许我们使用、复制、修改、发布、展示和分发此类内容。</p>
  </section>
  
  <section class="terms-section">
    <h2>6. 免责声明</h2>
    <p>我们的服务按"现状"和"可用"基础提供，不作任何明示或暗示的保证。我们不保证服务将是不间断的、安全的或无错误的。</p>
  </section>
  
  <section class="terms-section">
    <h2>7. 责任限制</h2>
    <p>在法律允许的最大范围内，我们不对您使用或无法使用服务所造成的任何直接、间接、附带、特殊、后果性或惩罚性损害负责。</p>
  </section>
  
  <section class="terms-section">
    <h2>8. 条款修改</h2>
    <p>我们保留在任何时候修改这些条款的权利。修改后的条款将在网站上发布时立即生效。继续使用我们的服务将被视为您接受修改后的条款。</p>
  </section>
  
  <section class="terms-section">
    <h2>9. 终止</h2>
    <p>我们可以根据自己的判断，在任何时候因任何理由终止或暂停您对我们服务的访问，包括但不限于违反这些条款。</p>
  </section>
  
  <section class="terms-section">
    <h2>10. 联系我们</h2>
    <p>如果您对这些服务条款有任何疑问，请通过电子邮件联系我们：contact@example.com</p>
  </section>
</div>`,
              css: `
.terms-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

h1 {
  font-size: 28px;
  color: #1e3c72;
  margin-bottom: 10px;
  text-align: center;
}

.last-updated {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
  font-style: italic;
}

.terms-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.terms-section:last-child {
  border-bottom: none;
}

h2 {
  font-size: 20px;
  color: #2a5298;
  margin: 20px 0 15px;
}

p {
  margin: 15px 0;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .terms-container {
    padding: 15px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  h2 {
    font-size: 18px;
  }
}`,
              javascript: '',
              description: '渐开线的小窝的服务条款，包含使用条件、用户责任、知识产权等重要法律信息。',
              keywords: '服务条款,使用条件,用户协议,法律条款,渐开线,博客',
              status: 'published',
              isHome: false,
              template: 'default',
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            },
            {
              id: 1000,
              title: '隐私政策',
              slug: 'privacy-policy',
              content: `<div class="privacy-container">
  <h1>渐开线的小窝 - 隐私政策</h1>
  <p class="last-updated">最后更新日期：2023年12月15日</p>
  
  <section class="privacy-section">
    <h2>1. 引言</h2>
    <p>渐开线的小窝("我们"、"本站")尊重并保护所有使用我们服务的用户的个人隐私权。本隐私政策旨在向您说明我们如何收集、使用、存储和分享您的个人信息，以及您可以如何访问、更新、控制和保护您的信息。</p>
  </section>
  
  <section class="privacy-section">
    <h2>2. 我们收集的信息</h2>
    <p>我们可能会收集以下类型的信息：</p>
    <ul>
      <li><strong>账户信息：</strong>当您注册账户时，我们会收集您的用户名、电子邮件地址和密码。</li>
      <li><strong>个人资料信息：</strong>您可以选择提供额外的个人信息，如头像、个人简介等。</li>
      <li><strong>内容数据：</strong>我们会存储您在我们平台上创建的内容，如评论、文章等。</li>
      <li><strong>使用数据：</strong>我们自动收集关于您如何使用我们服务的信息，如访问时间、浏览的页面、点击的链接等。</li>
      <li><strong>设备信息：</strong>我们可能会收集关于您使用的设备的信息，如IP地址、浏览器类型、操作系统等。</li>
      <li><strong>Cookie和类似技术：</strong>我们使用Cookie和类似技术来记住您的偏好，分析我们服务的使用情况，并提供个性化体验。</li>
    </ul>
  </section>
  
  <section class="privacy-section">
    <h2>3. 我们如何使用您的信息</h2>
    <p>我们可能将收集到的信息用于以下目的：</p>
    <ul>
      <li>提供、维护和改进我们的服务</li>
      <li>创建和维护您的账户</li>
      <li>处理和完成交易</li>
      <li>发送技术通知、更新、安全警报和支持消息</li>
      <li>响应您的评论和问题，提供客户服务</li>
      <li>与您沟通有关产品、服务、优惠、活动的信息</li>
      <li>监控和分析趋势、使用情况和活动</li>
      <li>保护我们的服务安全可靠</li>
    </ul>
  </section>
  
  <section class="privacy-section">
    <h2>4. 信息共享与披露</h2>
    <p>我们不会出售或出租您的个人信息给任何第三方。我们可能会在以下情况下共享您的信息：</p>
    <ul>
      <li><strong>服务提供商：</strong>我们可能会与提供服务帮助我们运营业务的第三方共享信息，如数据存储、维护服务、分析服务等。</li>
      <li><strong>遵守法律：</strong>如果我们认为披露是法律要求的，或者为了保护我们的权利、安全或他人的权利、安全，我们可能会披露信息。</li>
      <li><strong>业务转让：</strong>如果我们参与合并、收购或资产出售，您的信息可能会作为转让资产的一部分被转让。</li>
      <li><strong>经您同意：</strong>我们可能会在获得您同意的情况下将您的信息披露给第三方。</li>
    </ul>
  </section>
  
  <section class="privacy-section">
    <h2>5. 信息安全</h2>
    <p>我们采取合理的安全措施来保护您的个人信息免遭丢失、滥用和未经授权的访问、披露、更改和销毁。但请注意，尽管我们努力保护您的个人信息，但没有任何安全措施是完美的。</p>
  </section>
  
  <section class="privacy-section">
    <h2>6. 您的选择与权利</h2>
    <p>您可以通过登录您的账户来查看和更新您的个人信息。您也可以要求我们删除您的账户和个人信息，但请注意，某些信息可能会根据法律要求或合法业务目的被保留。</p>
  </section>
  
  <section class="privacy-section">
    <h2>7. Cookie政策</h2>
    <p>Cookie是放置在您设备上的小文本文件，帮助我们提供更好的用户体验。我们使用Cookie来记住您的偏好，分析我们服务的使用情况，并提供个性化体验。</p>
    <p>您可以通过更改浏览器设置来控制或删除Cookie。但请注意，禁用Cookie可能会影响我们网站的功能。</p>
  </section>
  
  <section class="privacy-section">
    <h2>8. 儿童隐私</h2>
    <p>我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果您是父母或监护人，并且您认为您的孩子向我们提供了个人信息，请联系我们。</p>
  </section>
  
  <section class="privacy-section">
    <h2>9. 隐私政策的变更</h2>
    <p>我们可能会不时更新本隐私政策。我们会通过在网站上发布新的隐私政策来通知您任何更改。我们鼓励您定期查看本隐私政策，以了解我们如何保护您的信息。</p>
  </section>
  
  <section class="privacy-section">
    <h2>10. 联系我们</h2>
    <p>如果您对本隐私政策有任何疑问，请通过以下方式联系我们：contact@example.com</p>
  </section>
</div>`,
              css: `
.privacy-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
  line-height: 1.6;
}

h1 {
  font-size: 28px;
  color: #1e3c72;
  margin-bottom: 10px;
  text-align: center;
}

.last-updated {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
  font-style: italic;
}

.privacy-section {
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.privacy-section:last-child {
  border-bottom: none;
}

h2 {
  font-size: 20px;
  color: #2a5298;
  margin: 20px 0 15px;
}

p {
  margin: 15px 0;
}

ul {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
}

strong {
  font-weight: 600;
}

@media (max-width: 768px) {
  .privacy-container {
    padding: 15px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  h2 {
    font-size: 18px;
  }
}`,
              javascript: '',
              description: '渐开线的小窝的隐私政策，说明我们如何收集、使用和保护用户的个人信息。',
              keywords: '隐私政策,个人信息,数据保护,Cookie政策,渐开线,博客',
              status: 'published',
              isHome: false,
              template: 'default',
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString()
            }
          ]
          localStorage.setItem('staticPages', JSON.stringify(this.pages))
        }
        this.loaded = true
        return this.pages
      } catch (error) {
        console.error('加载页面失败:', error)
        return []
      }
    },
    
    // 添加新页面
    async addPage(page: Omit<StaticPage, 'id' | 'createTime' | 'updateTime'>) {
      try {
        const newId = this.pages.length > 0 
          ? Math.max(...this.pages.map(p => p.id)) + 1 
          : 1
        
        const now = new Date().toISOString()
        
        // 如果新页面设置为首页，则将其他页面的isHome设为false
        if (page.isHome) {
          this.pages.forEach(p => {
            p.isHome = false
          })
        }
        
        const newPage: StaticPage = {
          ...page,
          id: newId,
          createTime: now,
          updateTime: now
        }
        
        this.pages.push(newPage)
        localStorage.setItem('staticPages', JSON.stringify(this.pages))
        
        return newPage
      } catch (error) {
        console.error('添加页面失败:', error)
        return null
      }
    },
    
    // 更新页面
    async updatePage(id: number, updateData: Partial<Omit<StaticPage, 'id' | 'createTime'>>) {
      try {
        const pageIndex = this.pages.findIndex(p => p.id === id)
        
        if (pageIndex === -1) {
          return false
        }
        
        // 如果更新为首页，则将其他页面的isHome设为false
        if (updateData.isHome) {
          this.pages.forEach(p => {
            if (p.id !== id) {
              p.isHome = false
            }
          })
        }
        
        const page = this.pages[pageIndex]
        
        this.pages[pageIndex] = {
          ...page,
          ...updateData,
          updateTime: new Date().toISOString()
        }
        
        localStorage.setItem('staticPages', JSON.stringify(this.pages))
        return true
      } catch (error) {
        console.error('更新页面失败:', error)
        return false
      }
    },
    
    // 删除页面
    async deletePage(id: number) {
      try {
        // 不允许删除首页
        const page = this.pages.find(p => p.id === id)
        if (page?.isHome) {
          return false
        }
        
        this.pages = this.pages.filter(p => p.id !== id)
        localStorage.setItem('staticPages', JSON.stringify(this.pages))
        return true
      } catch (error) {
        console.error('删除页面失败:', error)
        return false
      }
    },
    
    // 重置为默认页面
    resetToDefault() {
      this.pages = [
        {
          id: 1,
          title: '关于我',
          slug: 'about',
          content: `<h1>关于我</h1>
<div class="profile-section">
  <div class="avatar-container">
    <img src="https://api.dicebear.com/7.x/adventurer/svg?seed=John" alt="头像" class="avatar" />
  </div>
  <div class="bio-container">
    <h2>我是小明</h2>
    <p class="subtitle">前端开发工程师 / 博客爱好者</p>
    <p>欢迎来到我的个人博客，这里记录着我的编程心得、生活随想和学习笔记。希望我的内容能够对你有所帮助。</p>
    <div class="social-links">
      <a href="#" class="social-link">GitHub</a>
      <a href="#" class="social-link">微博</a>
      <a href="#" class="social-link">知乎</a>
    </div>
  </div>
</div>

<div class="section">
  <h2>个人简介</h2>
  <p>我是一名热爱技术的前端开发工程师，拥有5年的行业经验。擅长Vue.js、React等前端框架的开发，对用户体验和界面设计有独到的见解。</p>
  <p>在闲暇时间，我喜欢研究新技术、撰写技术博客，并且参与开源项目的贡献。相信技术可以改变世界，而分享则是技术进步的阶梯。</p>
</div>

<div class="section">
  <h2>技能专长</h2>
  <div class="skills">
    <div class="skill-item">
      <h3>前端开发</h3>
      <ul>
        <li>HTML5 / CSS3 / JavaScript</li>
        <li>Vue.js / React</li>
        <li>TypeScript</li>
        <li>响应式设计</li>
      </ul>
    </div>
    <div class="skill-item">
      <h3>后端技术</h3>
      <ul>
        <li>Node.js</li>
        <li>Express / Koa</li>
        <li>MongoDB / MySQL</li>
      </ul>
    </div>
  </div>
</div>

<div class="section">
  <h2>联系我</h2>
  <p>如果你有任何问题或合作意向，欢迎通过以下方式联系我：</p>
  <p>📧 邮箱：<a href="mailto:example@example.com">example@example.com</a></p>
</div>`,
          css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2.5em;
  color: #18a058;
  text-align: center;
  margin-bottom: 40px;
}

h2 {
  font-size: 1.8em;
  color: #333;
  margin-top: 30px;
  margin-bottom: 15px;
  padding-bottom: 10px;
}

h3 {
  font-size: 1.3em;
  color: #444;
}

p {
  margin-bottom: 15px;
}

a {
  color: #18a058;
  text-decoration: none;
  transition: color 0.3s;
}

a:hover {
  color: #0e7a41;
  text-decoration: underline;
}

.profile-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 40px;
  background: #f9f9f9;
  border-radius: 10px;
  padding: 30px;
}

.avatar-container {
  flex: 0 0 150px;
  margin-right: 30px;
}

.avatar {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #18a058;
}

.bio-container {
  flex: 1;
  min-width: 200px;
}

.subtitle {
  color: #666;
  font-size: 1.1em;
  margin-top: -10px;
  margin-bottom: 20px;
}

.social-links {
  margin-top: 20px;
}

.social-link {
  display: inline-block;
  margin-right: 15px;
  background: #18a058;
  color: white !important;
  padding: 8px 15px;
  border-radius: 4px;
  font-weight: 500;
  transition: background 0.3s;
}

.social-link:hover {
  background: #0e7a41;
  text-decoration: none;
}

.section {
  margin-bottom: 40px;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.skill-item {
  flex: 1;
  min-width: 200px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
}

.skill-item ul {
  padding-left: 20px;
}

.skill-item li {
  margin-bottom: 8px;
}

@media (max-width: 600px) {
  .avatar-container {
    margin: 0 auto 20px;
  }
  
  .profile-section {
    flex-direction: column;
    text-align: center;
  }
}`,
          javascript: 'console.log("关于页面已加载");',
          status: 'published',
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          description: '关于博主的个人介绍、专业技能和联系方式',
          keywords: '关于,介绍,个人简介,技能,联系方式',
          isHome: false,
          template: 'default'
        },
        {
          id: 2,
          title: '隐私政策',
          slug: 'privacy',
          content: `<h1>隐私政策</h1>

<div class="last-updated">最后更新日期：${new Date().toISOString().split('T')[0]}</div>

<div class="section">
  <h2>1. 引言</h2>
  <p>感谢您访问我们的博客网站。我们尊重您的隐私，并致力于保护您的个人信息。本隐私政策旨在向您说明我们如何收集、使用、分享和保护您的个人信息。</p>
  <p>请在使用我们的网站之前仔细阅读本隐私政策。通过访问和使用本网站，您同意接受本政策中描述的做法。</p>
</div>

<div class="section">
  <h2>2. 信息收集</h2>
  <h3>2.1 我们收集的信息类型</h3>
  <p>我们可能会收集以下类型的信息：</p>
  <ul>
    <li><strong>个人识别信息</strong>：当您注册账户、发表评论或与我们联系时，我们可能会收集您的姓名、电子邮件地址等个人信息。</li>
    <li><strong>非个人识别信息</strong>：我们可能会自动收集您的IP地址、浏览器类型、访问时间、访问页面等信息。</li>
    <li><strong>cookies和类似技术</strong>：我们使用cookies和类似技术来跟踪网站活动并维护您的偏好设置。</li>
  </ul>
  
  <h3>2.2 信息收集方式</h3>
  <p>我们通过以下方式收集信息：</p>
  <ul>
    <li>您直接提供的信息（如注册、评论等）</li>
    <li>自动收集（如通过cookies、服务器日志等）</li>
    <li>第三方来源（如社交媒体平台等）</li>
  </ul>
</div>

<div class="section">
  <h2>3. 信息使用</h2>
  <p>我们可能将收集到的信息用于以下目的：</p>
  <ul>
    <li>提供、维护和改进我们的网站和服务</li>
    <li>处理用户注册和管理用户账户</li>
    <li>回应您的询问和请求</li>
    <li>发送通知和更新</li>
    <li>防止欺诈和滥用</li>
    <li>进行研究和分析以改进用户体验</li>
  </ul>
</div>

<div class="section">
  <h2>4. 信息共享与披露</h2>
  <p>除以下情况外，我们不会出售、交易或转让您的个人信息给外部第三方：</p>
  <ul>
    <li>在获得您的同意的情况下</li>
    <li>与提供服务的可信赖合作伙伴共享（如托管服务提供商）</li>
    <li>法律要求或为保护我们的合法权益</li>
    <li>网站所有权变更（如合并或收购）</li>
  </ul>
</div>

<div class="section">
  <h2>5. 数据安全</h2>
  <p>我们采取合理的技术和组织措施来保护您的个人信息，防止未经授权的访问、使用或披露。但请注意，互联网上的任何数据传输都不能保证100%的安全性。</p>
</div>

<div class="section">
  <h2>6. 您的权利</h2>
  <p>根据适用的数据保护法律，您可能拥有以下权利：</p>
  <ul>
    <li>访问您的个人信息</li>
    <li>更正不准确的信息</li>
    <li>删除您的个人信息</li>
    <li>限制或反对处理您的信息</li>
    <li>数据可携带性</li>
  </ul>
  <p>要行使这些权利，请通过本政策末尾提供的联系方式与我们联系。</p>
</div>

<div class="section">
  <h2>7. cookies政策</h2>
  <p>我们的网站使用cookies和类似技术来改善您的浏览体验。您可以通过浏览器设置控制cookies的接受和拒绝。但请注意，禁用cookies可能会影响网站的某些功能。</p>
</div>

<div class="section">
  <h2>8. 儿童隐私</h2>
  <p>我们的网站不针对13岁以下的儿童。我们不会故意收集儿童的个人信息。如果您发现我们可能收集了儿童的个人信息，请立即联系我们，我们将采取适当措施删除相关信息。</p>
</div>

<div class="section">
  <h2>9. 政策变更</h2>
  <p>我们可能会不时更新本隐私政策。任何变更将在本页面上发布，并标注更新日期。我们鼓励您定期查看本政策以了解任何变更。</p>
</div>

<div class="section">
  <h2>10. 联系我们</h2>
  <p>如果您对本隐私政策有任何疑问或顾虑，请通过以下方式联系我们：</p>
  <p>📧 邮箱：<a href="mailto:privacy@example.com">privacy@example.com</a></p>
</div>`,
          css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2.2em;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.last-updated {
  text-align: center;
  color: #666;
  margin-bottom: 40px;
  font-style: italic;
}

h2 {
  font-size: 1.6em;
  color: #18a058;
  margin-top: 30px;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

h3 {
  font-size: 1.3em;
  color: #444;
  margin-top: 20px;
}

p {
  margin-bottom: 15px;
}

ul {
  padding-left: 20px;
  margin-bottom: 20px;
}

li {
  margin-bottom: 10px;
}

a {
  color: #18a058;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.section {
  margin-bottom: 30px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
}

strong {
  font-weight: 600;
}`,
          javascript: '',
          status: 'published',
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          description: '本网站的隐私政策，说明我们如何收集、使用和保护您的个人信息',
          keywords: '隐私政策,隐私,数据保护,cookies,个人信息',
          isHome: false,
          template: 'default'
        },
        {
          id: 3,
          title: '使用条款',
          slug: 'terms',
          content: `<h1>使用条款</h1>

<div class="last-updated">最后更新日期：${new Date().toISOString().split('T')[0]}</div>

<div class="section intro">
  <p>欢迎访问我们的博客网站。请仔细阅读以下使用条款，它们规定了您访问和使用本网站的条件。通过访问或使用本网站，您同意接受这些条款的约束。如果您不同意这些条款的任何部分，请勿使用本网站。</p>
</div>

<div class="section">
  <h2>1. 定义</h2>
  <ul>
    <li>"网站"指由我们经营的博客网站，包括所有页面、功能和内容。</li>
    <li>"内容"指网站上发布的所有文本、图像、视频、音频和其他资料。</li>
    <li>"用户"指访问和使用网站的个人或实体。</li>
    <li>"用户内容"指用户提交、发布或显示在网站上的内容，包括但不限于评论、反馈和建议。</li>
  </ul>
</div>

<div class="section">
  <h2>2. 网站使用规则</h2>
  <p>使用本网站时，您同意：</p>
  <ul>
    <li>不以任何方式干扰或中断网站的正常运行</li>
    <li>不尝试未经授权访问网站的系统或网络</li>
    <li>不使用任何自动化程序（如爬虫、机器人等）访问网站，除非得到明确许可</li>
    <li>不发布任何违法、诽谤、侮辱、威胁、骚扰、色情或其他不适当的内容</li>
    <li>不侵犯他人的知识产权、隐私权或其他权利</li>
    <li>不冒充他人或虚假陈述您与任何人或组织的关系</li>
    <li>遵守所有适用的法律和法规</li>
  </ul>
</div>

<div class="section">
  <h2>3. 知识产权</h2>
  <h3>3.1 网站内容</h3>
  <p>本网站及其内容（包括但不限于文本、图形、徽标、图标、图像和软件）受版权、商标和其他知识产权法保护。除非得到明确许可，否则不得复制、修改、分发或以其他方式使用网站内容。</p>
  
  <h3>3.2 用户内容</h3>
  <p>通过在网站上提交内容，您授予我们非独占、免版税、全球性的许可，允许我们使用、复制、修改、发布、分发和展示该内容。您声明并保证您拥有或已获得提交此类内容的必要权利。</p>
</div>

<div class="section">
  <h2>4. 免责声明</h2>
  <p>本网站及其内容按"原样"提供，不作任何明示或暗示的保证。我们不保证网站将不间断运行、无错误或安全，也不保证网站上提供的信息完全准确或最新。</p>
</div>

<div class="section">
  <h2>5. 责任限制</h2>
  <p>在法律允许的最大范围内，我们对因您使用或无法使用本网站而导致的任何直接、间接、附带、特殊、后果性或惩罚性损害不承担责任，即使我们已被告知此类损害的可能性。</p>
</div>

<div class="section">
  <h2>6. 赔偿</h2>
  <p>您同意对因您违反这些使用条款、侵犯他人权利或违反任何法律或法规而导致的所有索赔、损害、损失和费用（包括但不限于合理的律师费）进行抗辩、赔偿并使我们免受损害。</p>
</div>

<div class="section">
  <h2>7. 外部链接</h2>
  <p>本网站可能包含指向第三方网站的链接。这些链接仅为方便用户而提供，我们不控制且不对这些网站的内容或隐私政策负责。您访问任何链接网站的风险由您自行承担。</p>
</div>

<div class="section">
  <h2>8. 终止</h2>
  <p>我们保留在任何时候、以任何理由、不经通知即终止或限制您访问本网站的权利。条款中关于知识产权、免责声明、责任限制和赔偿的规定在条款终止后仍然有效。</p>
</div>

<div class="section">
  <h2>9. 条款修改</h2>
  <p>我们保留随时修改这些使用条款的权利。任何更改都将在网站上发布并自发布之日起生效。继续使用网站将被视为接受修改后的条款。</p>
</div>

<div class="section">
  <h2>10. 管辖法律</h2>
  <p>这些使用条款受中华人民共和国法律管辖，任何与这些条款相关的争议应提交至有管辖权的法院解决。</p>
</div>

<div class="section">
  <h2>11. 可分割性</h2>
  <p>如果这些使用条款的任何部分被认定为无效或不可执行，该部分将被视为可从这些条款中分离，不影响其余条款的有效性和可执行性。</p>
</div>

<div class="section">
  <h2>12. 联系我们</h2>
  <p>如果您对这些使用条款有任何疑问，请通过以下方式联系我们：</p>
  <p>📧 邮箱：<a href="mailto:terms@example.com">terms@example.com</a></p>
</div>`,
          css: `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2.2em;
  color: #333;
  text-align: center;
  margin-bottom: 10px;
}

.last-updated {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-style: italic;
}

.intro {
  font-size: 1.1em;
  border-left: 4px solid #18a058;
  padding-left: 20px;
}

h2 {
  font-size: 1.6em;
  color: #18a058;
  margin-top: 30px;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

h3 {
  font-size: 1.3em;
  color: #444;
  margin-top: 20px;
}

p {
  margin-bottom: 15px;
}

ul {
  padding-left: 20px;
  margin-bottom: 20px;
}

li {
  margin-bottom: 10px;
}

a {
  color: #18a058;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

.section {
  margin-bottom: 30px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
}`,
          javascript: '',
          status: 'published',
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString(),
          description: '使用本网站的条款和条件，包括使用规则、知识产权和免责声明',
          keywords: '使用条款,条款和条件,使用规则,免责声明,知识产权',
          isHome: false,
          template: 'default'
        }
      ]
      localStorage.setItem('staticPages', JSON.stringify(this.pages))
    }
  }
}) 