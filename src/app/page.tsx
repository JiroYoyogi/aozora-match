"use client";
import { useState } from "react";

type Item = {
  file: string;
  author: string;
  title: string;
  url: string;
  suggestion: string;
  similarity: number;
}
type Status = "idle" | "searching" | "success" | "error";

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
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const doSearch = async () => {

    console.log(feeling);

    setStatus("searching");
    setErrorMessage("");

    try {
      await new Promise<void>((reso) => {
        setTimeout(() => {
          reso();
        }, 1000);
      });
      setStatus("success");

    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Unknown error");
    }
    
  }

  return (
    <div className="font-sans min-h-screen py-20">

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
        <button 
          className="btn-recommend text-sm" 
          onClick={doSearch}
          disabled={status === "searching"}
        >
          オススメを探す
        </button>
      </div>
      
      <p className="text-center pt-8 leading-relaxed">
        {
          status === "searching" ? <span className="loading-dots">オススメを検索中</span>:
          status === "success" ? <span>次の３冊はいかがでしょうか？</span> :
          status === "error" ? <span>エラーが発生しました。もう一度お試しください。</span> :
          <span>気分にぴったりの本を、AIがあなたの代わりに探します。<br />気持ちを選んで「オススメを探す」ボタンを押してください。</span>
        }
      </p>

      <div className="mt-8 w-[800px] mx-auto">

        {
          errorMessage && <p className="font-bold text-sm"> {errorMessage} </p>
        }

        <ul>
          {
            suggestions.map((item, key) => (
              <li key={key} className="text-sm border-b pb-4 mt-4">
                <h2>
                  <span className="font-bold text-lg">{ item.title }</span>
                  <span className="ml-4 font-bold text-sm">{ item.author }</span>
                </h2>
                <p className="mt-4 leading-relaxed">{ item.suggestion }</p>
                <p className="mt-4">
                  <a href={ item.url }>{ item.url }</a>
                </p>
              </li>
            ))
          }
        </ul>
      </div>

    </div>
  );
}
