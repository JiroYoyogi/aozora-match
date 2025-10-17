"use client";
import { useState } from "react";

const feelingList = [
  "胸が締め付けられるような、切ない気持ちになりたい",
  "人の優しさや思いやりに触れて、心を温めたい",
  "すっきり晴れた空のように、爽やかな気分になりたい",
  "何か心がざわざわする、揺さぶられる本を読みたい",
  "昔の記憶や感情を思い出して、懐かしさに包まれたい",
  "思わず涙がこぼれるような、泣ける物語に触れたい",
  "人生や社会について、深く考えさせられる作品を読みたい",
  "絶望の中に光を見いだすような、救われる物語が読みたい",
  "読み終わったあと、自分も頑張ろうと思える話を読みたい",
];

export default function Home() {
  const [feeling, setFeeling] = useState(feelingList[0]);

  console.log(feeling);

  return (
    <div className="font-sans min-h-screen pt-20">
      <div className="flex flex-col gap-[32px] items-center">
        <h1 className="font-bold">本を読んでどんな気持ちになりたいですか？</h1>
        <select
          className="select-box text-sm"
          onChange={(e) => setFeeling(e.target.value)}
        >
          {feelingList.map((item, key) => (
            <option key={key}>{item}</option>
          ))}
        </select>
        <button className="btn-recommend text-sm">オススメを探す</button>
      </div>

      <div className="text-center pt-8 leading-relaxed">
        <p>
          気分にぴったりの本を、AIがあなたの代わりに探します。<br />気持ちを選んで「オススメを探す」ボタンを押してみてください。
        </p>
      </div>
    </div>
  );
}
