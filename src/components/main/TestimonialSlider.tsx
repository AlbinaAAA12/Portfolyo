import type { Locale } from '../../types';
import { asset } from '../../lib/assets';
import { NoOrphans } from '../../lib/typography';

export default function TestimonialSlider({ locale, name }: { locale: Locale; name: string }) {
  const russian = locale === 'ru';

  return <div className="testimonial-wrap">
    <div className="testimonial-viewport testimonial-viewport--single" role="region" aria-label={russian ? 'Отзывы' : 'Testimonials'}>
      <article className="testimonial" aria-label={russian ? 'Отзыв 1 из 1' : 'Testimonial 1 of 1'}>
        <p className="testimonial-quote"><NoOrphans>{russian
          ? <>&laquo;<strong>Альбина сделала отличный дизайн платформы и лендинг для моего продукта.</strong> Мы легко нашли общий язык, мне было приятно с ней работать. В процессе нашего взаимодействия я чувствовала вовлеченность и желание сделать работу наилучшим образом. <strong>Альбина сделала работу именно так, как я представляла.</strong>&raquo;</>
          : <>&ldquo;<strong>Albina created an excellent platform design and landing page for my product.</strong> We easily found common ground, and I enjoyed working with her. Throughout our collaboration, I felt her engagement and desire to do the best possible job. <strong>Albina delivered exactly what I had envisioned.</strong>&rdquo;</>}</NoOrphans></p>
        <div className="testimonial-author"><span className="testimonial-mark"><img src={asset('figma/testimonial-veritas.svg')} alt="" /></span><div><strong>{name}</strong><span>{russian ? 'руководитель ООО "Веритас"' : 'Head of Veritas LLC'}</span></div></div>
      </article>
    </div>
  </div>;
}
