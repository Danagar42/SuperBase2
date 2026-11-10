/* SuperBase chart renderer. Offline, dependency-free canvas chart.
 * Numeric temperature axis, exact source data only, gaps left unconnected.
 */
(function () {
  'use strict';
  class Chart {
    constructor(context, config) {
      this.ctx = context;
      this.canvas = context.canvas;
      this.data = config.data;
      this.options = config.options || {};
      this.hoverIndex = -1;
      this.metrics = null;
      this.resizeObserver = typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => this.update()) : null;
      if (this.resizeObserver) this.resizeObserver.observe(this.canvas.parentElement || this.canvas);
      this.onMouseMove = (e) => this.pointerMove(e);
      this.onMouseLeave = () => { this.hoverIndex = -1; this.update(); };
      this.canvas.addEventListener('mousemove', this.onMouseMove);
      this.canvas.addEventListener('mouseleave', this.onMouseLeave);
      this.update();
    }
    destroy() {
      this.resizeObserver?.disconnect();
      this.canvas.removeEventListener('mousemove', this.onMouseMove);
      this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    }
    pointerMove(event) {
      const m = this.metrics;
      if (!m) return;
      const box = this.canvas.getBoundingClientRect();
      const px = event.clientX - box.left;
      const py = event.clientY - box.top;
      if (px < m.left - 15 || px > m.right + 15 || py < m.top - 10 || py > m.bottom + 10) {
        if (this.hoverIndex !== -1) { this.hoverIndex = -1; this.update(); }
        return;
      }
      let idx = -1;
      let dist = Infinity;
      m.temperatures.forEach((temp, i) => {
        const x = m.x(temp);
        const currentDist = Math.abs(px - x);
        if (currentDist < dist) { dist = currentDist; idx = i; }
      });
      if (dist > 35) idx = -1;
      if (this.hoverIndex !== idx) { this.hoverIndex = idx; this.update(); }
    }
    update() {
      const ctx = this.ctx;
      if (!ctx || !this.canvas.isConnected) return;
      const parent = this.canvas.parentElement;
      const box = parent.getBoundingClientRect();
      const width = Math.max(300, box.width || 700);
      const height = Math.max(280, box.height || 430);
      const scale = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(width * scale);
      this.canvas.height = Math.round(height * scale);
      this.canvas.style.width = width + 'px';
      this.canvas.style.height = height + 'px';
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const dark = document.documentElement.classList.contains('dark');
      const foreground = dark ? '#cbd5e1' : '#475569';
      const titleColor = dark ? '#e2e8f0' : '#334155';
      const gridColor = dark ? 'rgba(100,116,139,.25)' : 'rgba(148,163,184,.28)';
      const axisColor = dark ? '#94a3b8' : '#64748b';
      const labels = this.data.labels || [];
      const temperatures = labels.map(Number).filter(Number.isFinite);
      if (!temperatures.length) return;
      const values = this.data.datasets.flatMap(ds => ds.data).filter(n => n !== null && n !== undefined && n !== '' && Number.isFinite(Number(n))).map(Number);
      if (!values.length) return;
      const minX = Math.min(...temperatures);
      const maxX = Math.max(...temperatures);
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const range = maxValue - minValue || Math.max(10, Math.abs(maxValue) * .1);
      const stepRaw = (range * 1.17) / 5;
      const power = Math.pow(10, Math.floor(Math.log10(Math.max(stepRaw, 1e-9))));
      const step = [1, 2, 2.5, 5, 10].map(n => n * power).find(n => n >= stepRaw) || (10 * power);
      const minY = Math.floor((minValue - range * .07) / step) * step;
      const maxY = Math.ceil((maxValue + range * .07) / step) * step;
      const left = 82, right = width - 20, top = 48, bottom = height - 56;
      const x = t => left + (t - minX) / (maxX - minX || 1) * (right - left);
      const y = v => bottom - (v - minY) / (maxY - minY || 1) * (bottom - top);
      this.metrics = { left, right, top, bottom, x, y, temperatures };
      const font = 'Inter, system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      const legendSize = 12;
      const legendItems = this.data.datasets.map(ds => ({label:ds.label, color:ds.borderColor}));
      ctx.font = '600 12px ' + font;
      const legendWidths = legendItems.map(item => Math.min(width * .48, ctx.measureText(item.label).width + 42));
      const legendTotal = legendWidths.reduce((a,b)=>a+b,0) + (legendItems.length-1)*20;
      let legendX = Math.max(left, (width - legendTotal)/2);
      legendItems.forEach((item,i)=>{
        ctx.fillStyle=item.color;
        ctx.fillRect(legendX, 9, 27, legendSize-2);
        ctx.fillStyle=foreground;
        ctx.textAlign='left';
        ctx.fillText(item.label,legendX+34,14);
        legendX += legendWidths[i]+20;
      });
      ctx.lineWidth=1;
      ctx.font='600 12px '+font;
      ctx.strokeStyle=gridColor;
      const ticksY=[];
      for (let t=minY; t <= maxY + step/10 && ticksY.length < 25; t+=step) ticksY.push(t);
      ticksY.forEach(v=>{
        const py=y(v);
        ctx.beginPath();ctx.moveTo(left,py);ctx.lineTo(right,py);ctx.stroke();
        ctx.fillStyle=foreground;
        ctx.textAlign='right';
        ctx.fillText(Number(v.toFixed(5)).toLocaleString('uk-UA'),left-13,py);
      });
      const maxLabels = Math.max(2, Math.floor((right-left)/59));
      const tickStep = Math.max(1, Math.ceil(temperatures.length/maxLabels));
      temperatures.forEach((t,i)=>{
        if (i%tickStep!==0 && i !== temperatures.length-1) return;
        const px=x(t);
        ctx.strokeStyle=gridColor;
        ctx.beginPath();ctx.moveTo(px,top);ctx.lineTo(px,bottom);ctx.stroke();
        ctx.textAlign='center';ctx.fillStyle=foreground;
        ctx.fillText(String(t),px,bottom+19);
      });
      ctx.strokeStyle=axisColor;
      ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,bottom);ctx.lineTo(right,bottom);ctx.stroke();
      ctx.fillStyle=titleColor;
      ctx.font='700 14px '+font;
      ctx.textAlign='center';
      ctx.fillText('Температура, °C',(left+right)/2,height-15);
      ctx.save();ctx.translate(20,(top+bottom)/2);ctx.rotate(-Math.PI/2);
      ctx.fillText('Напруження, МПа',0,0);ctx.restore();
      ctx.save(); ctx.beginPath();ctx.rect(left-5,top-5,right-left+10,bottom-top+10);ctx.clip();
      this.data.datasets.forEach(ds=>{
        ctx.strokeStyle=ds.borderColor;ctx.fillStyle=ds.backgroundColor || ds.borderColor;
        ctx.lineWidth=2.5;let inSegment=false;
        ds.data.forEach((raw,i)=>{
          const v=raw===null||raw===undefined||raw===''?NaN:Number(raw);
          if (!Number.isFinite(v)) {inSegment=false;return;}
          const px=x(temperatures[i]),py=y(v);
          if (inSegment) {ctx.beginPath();ctx.moveTo(x(temperatures[i-1]),y(Number(ds.data[i-1])));ctx.lineTo(px,py);ctx.stroke();}
          inSegment=true;
        });
        ds.data.forEach((raw,i)=>{
          if (raw===null||raw===undefined||raw==='')return;
          const v=Number(raw);if(!Number.isFinite(v))return;
          const px=x(temperatures[i]),py=y(v);
          ctx.beginPath();ctx.arc(px,py,i===this.hoverIndex?5.5:4,0,2*Math.PI);ctx.fill();
        });
      });
      if (this.hoverIndex>=0) {
        const px=x(temperatures[this.hoverIndex]);
        ctx.setLineDash([4,5]);ctx.strokeStyle=axisColor;ctx.lineWidth=1;
        ctx.beginPath();ctx.moveTo(px,top);ctx.lineTo(px,bottom);ctx.stroke();ctx.setLineDash([]);
      }
      ctx.restore();
      if (this.hoverIndex>=0) {
        const i=this.hoverIndex;
        const rows=this.data.datasets.filter(ds=>ds.data[i]!==null && ds.data[i]!==undefined && ds.data[i]!=='' && Number.isFinite(Number(ds.data[i])));
        if (rows.length) {
          const xTooltip = Math.min(right-205,Math.max(left+8,x(temperatures[i])+12));
          const yTooltip=top+10;
          const boxW=198,boxH=36+rows.length*23;
          ctx.fillStyle=dark?'rgba(15,23,42,.96)':'rgba(255,255,255,.96)';
          ctx.strokeStyle=dark?'#475569':'#cbd5e1';ctx.lineWidth=1;
          ctx.beginPath();ctx.roundRect(xTooltip,yTooltip,boxW,boxH,8);ctx.fill();ctx.stroke();
          ctx.font='700 12px '+font;ctx.textAlign='left';ctx.fillStyle=titleColor;
          ctx.fillText(`${temperatures[i]} °C`,xTooltip+12,yTooltip+18);
          rows.forEach((ds,j)=>{
            const yy=yTooltip+40+j*23;ctx.fillStyle=ds.borderColor;ctx.fillRect(xTooltip+12,yy-5,9,9);
            ctx.fillStyle=foreground;ctx.font='600 12px '+font;
            const title=ds.label.toLowerCase().includes('текучості')?'Rp0,2':'Rm';
            ctx.fillText(`${title}: ${Number(ds.data[i]).toLocaleString('uk-UA')} МПа`,xTooltip+28,yy);
          });
        }
      }
    }
  }
  window.Chart=Chart;
})();
