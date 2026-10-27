import { asset } from '../../lib/assets';
import './SpiritPreview.css';

export default function SpiritPreview() {
  return <div className="spirit-preview" aria-hidden="true">
    <div className="spirit-preview__backdrop"><img src={asset('figma/cdbc0.png')} alt="" /></div>
    <div className="spirit-preview__frame"><img src={asset('figma/spirit-empty-state.svg')} alt="" /></div>
  </div>;
}
