import React, { useContext, useEffect, useState } from "react";
import AccountSidebar from "../../components/AccountSidebar";
import { fetchDataFromApi } from "../../utils/api";
import { MyContext } from "../../App";

const typeLabel = {
  earned: { label: "Earned", color: "text-green-600", sign: "+" },
  redeemed: { label: "Redeemed", color: "text-red-500", sign: "" },
  referral_friend: { label: "Referral Bonus", color: "text-blue-600", sign: "+" },
  referral_reward: { label: "Referral Reward", color: "text-purple-600", sign: "+" },
  admin: { label: "Admin Bonus", color: "text-orange-500", sign: "+" },
};

const Points = () => {
  const context = useContext(MyContext);
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDataFromApi("/api/points/my-points").then((res) => {
      const d = res?.response?.data || res;
      if (d?.success) setData(d.data);
    });
  }, []);

  const copyCode = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyLink = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const rupeeValue = data ? Math.floor((data.points / 1000) * 100) : 0;

  return (
    <section className="py-5 lg:py-10 px-3">
      <div className="container flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-[25%]">
          <AccountSidebar />
        </div>

        <div className="w-full lg:w-[75%] flex flex-col gap-5">
          {/* Points Balance Card */}
          <div className="card bg-white shadow-md rounded-md p-6">
            <h2 className="text-[18px] font-[700] mb-4">My Points</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-gradient-to-br from-[#FFA239] to-[#ff7c00] rounded-xl p-5 text-white">
                <p className="text-[13px] opacity-80 mb-1">Total Points</p>
                <p className="text-[42px] font-[800] leading-none">{data?.points?.toLocaleString() ?? 0}</p>
                <p className="text-[13px] opacity-80 mt-2">= Rs. {rupeeValue.toLocaleString()} redeemable value</p>
              </div>
              <div className="flex-1 bg-[#f8f8f8] rounded-xl p-5">
                <p className="text-[13px] text-[rgba(0,0,0,0.5)] mb-3 font-[500]">How points work</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFA239] text-white text-[11px] font-[700] flex items-center justify-center flex-shrink-0">1</span>
                    <span className="text-[13px]">Earn <strong>1 point</strong> for every Rs. 10 spent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFA239] text-white text-[11px] font-[700] flex items-center justify-center flex-shrink-0">2</span>
                    <span className="text-[13px]"><strong>1,000 points</strong> = Rs. 100 off your next order</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFA239] text-white text-[11px] font-[700] flex items-center justify-center flex-shrink-0">3</span>
                    <span className="text-[13px]">Redeem at checkout anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="card bg-white shadow-md rounded-md p-6">
            <h2 className="text-[18px] font-[700] mb-1">Refer & Earn</h2>
            <p className="text-[13px] text-[rgba(0,0,0,0.5)] mb-4">
              Share your referral code. When your friend makes their first purchase (Rs. 50+), you both earn bonus points!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1 bg-[#fff8f0] border-2 border-dashed border-[#FFA239] rounded-xl p-4 flex flex-col items-center gap-2">
                <p className="text-[12px] text-[rgba(0,0,0,0.5)]">Your Referral Code</p>
                <p className="text-[24px] font-[800] tracking-widest text-[#FFA239]">
                  {data?.referralCode || "—"}
                </p>
                <button
                  onClick={copyCode}
                  className="text-[12px] bg-[#FFA239] text-white px-4 py-1.5 rounded-md font-[600] hover:bg-[#e8922d]"
                >
                  {copied ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <div className="flex-1 bg-[#f8f8f8] rounded-xl p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[18px] font-[700]">F</div>
                  <div>
                    <p className="text-[13px] font-[600]">Your Friend gets</p>
                    <p className="text-[12px] text-[rgba(0,0,0,0.5)]">250 points (= Rs. 25) on first purchase</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-[18px] font-[700]">Y</div>
                  <div>
                    <p className="text-[13px] font-[600]">You get</p>
                    <p className="text-[12px] text-[rgba(0,0,0,0.5)]">500 points (= Rs. 50) when they buy</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <input
                readOnly
                value={data?.referralLink || ""}
                className="flex-1 border border-[rgba(0,0,0,0.15)] rounded-md px-3 py-2 text-[12px] text-[rgba(0,0,0,0.6)] bg-[#f8f8f8]"
              />
              <button
                onClick={copyLink}
                className="text-[12px] bg-[rgba(0,0,0,0.06)] hover:bg-[rgba(0,0,0,0.1)] px-4 py-2 rounded-md font-[600]"
              >
                Copy Link
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="card bg-white shadow-md rounded-md p-6">
            <h2 className="text-[18px] font-[700] mb-4">Points History</h2>
            {data?.transactions?.length === 0 ? (
              <p className="text-[13px] text-[rgba(0,0,0,0.4)] text-center py-8">No transactions yet. Start shopping to earn points!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-[rgba(0,0,0,0.08)]">
                      <th className="text-left py-2 font-[600] text-[rgba(0,0,0,0.5)]">Type</th>
                      <th className="text-left py-2 font-[600] text-[rgba(0,0,0,0.5)]">Description</th>
                      <th className="text-left py-2 font-[600] text-[rgba(0,0,0,0.5)]">Date</th>
                      <th className="text-right py-2 font-[600] text-[rgba(0,0,0,0.5)]">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.transactions?.map((t) => {
                      const meta = typeLabel[t.type] || { label: t.type, color: "text-gray-600", sign: "+" };
                      const isNeg = t.points < 0;
                      return (
                        <tr key={t._id} className="border-b border-[rgba(0,0,0,0.04)] hover:bg-[#fafafa]">
                          <td className="py-3">
                            <span className={`font-[600] ${meta.color}`}>{meta.label}</span>
                          </td>
                          <td className="py-3 text-[rgba(0,0,0,0.6)]">{t.description}</td>
                          <td className="py-3 text-[rgba(0,0,0,0.4)]">
                            {new Date(t.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className={`py-3 text-right font-[700] ${isNeg ? "text-red-500" : "text-green-600"}`}>
                            {isNeg ? "" : "+"}{t.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Points;
