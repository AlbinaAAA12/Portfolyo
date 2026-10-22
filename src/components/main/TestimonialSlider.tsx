import { useRef, useState, type WheelEvent } from 'react';
import type { Locale } from '../../types';
import { asset } from '../../lib/assets';

export default function TestimonialSlider({ locale, name }: { locale: Locale; name: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const scrollTo = (index: number) => viewport.current?.scrollTo({ left: index * (viewport.current.clientWidth), behavior: 'smooth' });
  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.currentTarget.scrollBy({ left: event.deltaY, behavior: 'auto' });
    }
  };

  return <div className="testimonial-wrap">
    <div className="testimonial-viewport" ref={viewport} tabIndex={0} role="region" onScroll={(event) => {
      const node = event.currentTarget;
      const index = Math.round(node.scrollLeft / Math.max(1, node.clientWidth));
      setActive(Math.min(4, index));
    }} onWheel={handleWheel} aria-label={locale === 'ru' ? 'Отзывы' : 'Testimonials'}>
      {Array.from({ length: 5 }, (_, index) => <article className="testimonial" key={index} aria-label={`${locale === 'ru' ? 'Отзыв' : 'Testimonial'} ${index + 1} ${locale === 'ru' ? 'из' : 'of'} 5`}>
        <p className="testimonial-quote">“Lorem ipsum dolor sit amet consectetur. <strong>Pellentesque pretium ut enim at elementum.</strong> Eget tortor tempor elementum amet nisi amet vel gravida sed. Ipsum maecenas nec nunc duis morbi non. <strong>Lectus sit dolor semper bibendum diam libero.</strong>”</p>
        <div className="testimonial-author"><span className="testimonial-mark"><img src={asset('figma/ada21.svg')} alt="" /></span><div><strong>{name}</strong><span>{locale === 'ru' ? 'Дизайнер' : 'Designer'}</span></div></div>
      </article>)}
    </div>
    <div className="pagination-dots" aria-label={locale === 'ru' ? `Отзыв ${active + 1} из 5` : `Testimonial ${active + 1} of 5`}>
      {Array.from({ length: 5 }, (_, index) => <button type="button" key={index} className={active === index ? 'current' : ''} aria-label={`${locale === 'ru' ? 'Перейти к отзыву' : 'Go to testimonial'} ${index + 1}`} aria-current={active === index ? 'true' : undefined} onClick={() => scrollTo(index)} />)}
    </div>
  </div>;
}
