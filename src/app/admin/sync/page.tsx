import {revalidatePath} from 'next/cache';
import AdminShell from '@/components/AdminShell';
import {requireAdminSession} from '@/lib/adminAuth';
import {readAdminBusinessData} from '@/lib/adminBusinessData';
import {formatAdminDate} from '@/lib/adminDataViews';
import {readContactFormHealth, runContactFormHealthCheck} from '@/lib/contactFormHealth';
import {readEmailLogs} from '@/lib/commerceStore';
import {readGoogleSeoSnapshot} from '@/lib/googleSeo';
import {readInquiryNotification} from '@/lib/inquiryNotifications';
import {readNewsAutopilotState} from '@/lib/newsAutopilot';
import {defaultNewsSite} from '@/lib/newsSiteConfig';
import {readSitemapState} from '@/lib/sitemapState';

export const dynamic = 'force-dynamic';

async function checkContactForm() {
  'use server';
  await requireAdminSession();
  await runContactFormHealthCheck();
  revalidatePath('/admin/sync');
}

export default async function AdminSyncPage() {
  await requireAdminSession();
  const [{orders, events}, emails, formCheck, seo, sitemap, newsAutopilot] = await Promise.all([
    readAdminBusinessData(),
    readEmailLogs(),
    readContactFormHealth(),
    readGoogleSeoSnapshot(),
    readSitemapState(),
    readNewsAutopilotState()
  ]);
  const newsSite = defaultNewsSite();
  const newsState = newsSite ? newsAutopilot.sites[newsSite.site_id] : undefined;
  const lastInquiryEmail = emails.findLast((email) => email.templateType === 'contact_inquiry');
  const smtpStatus: Record<string, string> = {sent: '邮件服务已接受', skipped: '未发出', failed: '发送失败', sending: '处理中', unknown: '等待核对'};
  const checkedNotification = formCheck?.inquiryId ? await readInquiryNotification(formCheck.inquiryId) : null;
  const lastCheck = sitemap.lastRun;
  const mapValid = lastCheck?.validationPassed ?? lastCheck?.success;

  return (
    <AdminShell active="sync">
      <div className="admin-title">
        <p className="eyebrow">运营状态</p>
        <h1>业务服务状态</h1>
        <p>集中查看订单、客户咨询、内容发布和搜索表现的最近更新时间。</p>
      </div>
      <div className="admin-metrics">
        <article><span>订单</span><strong>{orders.length}</strong><small>当前业务订单</small></article>
        <article><span>访问事件</span><strong>{events.length}</strong><small>已记录的站内行为</small></article>
        <article><span>搜索页面</span><strong>{seo.pages.length}</strong><small>已同步的搜索表现页面</small></article>
        <article><span>新闻自动采集</span><strong>{newsSite?.news.enabled ? '运行中' : '已停用'}</strong><small>不影响第三方博客发布</small></article>
      </div>
      <section className="admin-panel">
        <h2>业务更新情况</h2>
        <dl className="admin-config-list">
          <div><dt>站点地图</dt><dd>{lastCheck ? `${mapValid ? '校验通过' : '校验异常'} · ${formatAdminDate(lastCheck.finishedAt)}` : '等待最近一次检查结果。'}</dd></div>
          <div><dt>Google 提交</dt><dd>{lastCheck?.googleSubmission.success ? 'Google 已接受' : lastCheck?.googleSubmission.attempted ? '提交失败' : '本次未提交'} · <a className="admin-detail-link" href="/admin/seo">查看回执</a></dd></div>
          <div><dt>搜索表现</dt><dd>{seo.status === 'ok' ? `最近更新：${formatAdminDate(seo.syncedAt)}` : '等待新的搜索表现数据。'}</dd></div>
          <div><dt>新闻内容</dt><dd>{newsState?.lastPublishedAt ? `最近发布：${formatAdminDate(newsState.lastPublishedAt)}` : '暂无最近发布记录。'}</dd></div>
          <div><dt>最近询价通知</dt><dd>{lastInquiryEmail ? `${formatAdminDate(lastInquiryEmail.createdAt)} · ${smtpStatus[lastInquiryEmail.status] || '等待核对'}` : '暂无通知记录'}</dd></div>
        </dl>
      </section>
      <section className="admin-panel">
        <h2>询价表单核验</h2>
        <dl className="admin-config-list">
          <div><dt>最近核验</dt><dd>{formatAdminDate(formCheck?.checkedAt || '')}</dd></div>
          <div><dt>询价编号</dt><dd>{formCheck?.inquiryId || '-'}</dd></div>
          <div><dt>业务记录</dt><dd>{formCheck ? formCheck.persisted ? '已核对入库' : '未确认入库' : '等待核验'}</dd></div>
          <div><dt>邮件通知</dt><dd>{formCheck ? smtpStatus[checkedNotification?.status || formCheck.emailStatus] || '等待核对' : '等待核验'}</dd></div>
        </dl>
        <form action={checkContactForm} className="admin-actions">
          <button className="button primary small" type="submit">核验询价与邮件通知</button>
        </form>
      </section>
    </AdminShell>
  );
}
