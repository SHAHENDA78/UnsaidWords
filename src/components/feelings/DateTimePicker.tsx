"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateTimePickerProps {
  value: string;
  onChange: (isoString: string) => void;
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [pastError, setPastError] = useState("");
  const selectedDate = value ? new Date(value) : undefined;

  const currentHour12 = selectedDate
    ? selectedDate.getHours() % 12 === 0
      ? 12
      : selectedDate.getHours() % 12
    : 12;
  const currentMinute = selectedDate ? selectedDate.getMinutes() : 0;
  const currentPeriod = selectedDate && selectedDate.getHours() >= 12 ? "PM" : "AM";

  const [hourText, setHourText] = useState(String(currentHour12));
  const [minuteText, setMinuteText] = useState(String(currentMinute).padStart(2, "0"));

  function combineDateTime(date: Date, hour12: number, minute: number, period: "AM" | "PM") {
    const result = new Date(date);
    let hour24 = hour12 % 12;
    if (period === "PM") hour24 += 12;
    result.setHours(hour24, minute, 0, 0);
    return result;
  }

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;
    setPastError("");
    const combined = combineDateTime(date, currentHour12, currentMinute, currentPeriod);
    onChange(combined.toISOString());
  }

  function commitTimeChange(hour12: number, minute: number, period: "AM" | "PM") {
    setPastError("");
    const base = selectedDate || new Date();
    const combined = combineDateTime(base, hour12, minute, period);
    onChange(combined.toISOString());
  }

  function handleHourBlur() {
    let n = parseInt(hourText, 10);
    if (isNaN(n)) n = currentHour12;
    n = Math.min(12, Math.max(1, n));
    setHourText(String(n));
    commitTimeChange(n, currentMinute, currentPeriod);
  }

  function handleMinuteBlur() {
    let n = parseInt(minuteText, 10);
    if (isNaN(n)) n = currentMinute;
    n = Math.min(59, Math.max(0, n));
    setMinuteText(String(n).padStart(2, "0"));
    commitTimeChange(currentHour12, n, currentPeriod);
  }

  function togglePeriod() {
    const newPeriod = currentPeriod === "AM" ? "PM" : "AM";
    commitTimeChange(currentHour12, currentMinute, newPeriod);
  }

  function stepHour(direction: 1 | -1) {
    let newHour = currentHour12 + direction;
    if (newHour > 12) newHour = 1;
    if (newHour < 1) newHour = 12;
    setHourText(String(newHour));
    commitTimeChange(newHour, currentMinute, currentPeriod);
  }

  function stepMinute(direction: 1 | -1) {
    let newMinute = currentMinute + direction;
    if (newMinute > 59) newMinute = 0;
    if (newMinute < 0) newMinute = 59;
    setMinuteText(String(newMinute).padStart(2, "0"));
    commitTimeChange(currentHour12, newMinute, currentPeriod);
  }

  function handleDone() {
    if (selectedDate && selectedDate.getTime() < new Date().getTime()) {
      setPastError("This time has already passed. Please pick a future time.");
      return;
    }
    setOpen(false);
  }

  const displayText = selectedDate
    ? selectedDate.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Pick a date & time";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 pl-4 pr-5 py-3 rounded-2xl border border-border bg-surface hover:border-plum focus:outline-none focus:ring-2 focus:ring-plum/10 transition-all text-sm text-ink"
        >
          <CalendarIcon size={16} className="text-plum" />
          {displayText}
        </button>
      </PopoverTrigger>
            <PopoverContent
        align="center"
        collisionPadding={16}
        className="w-[calc(100vw-3rem)] sm:w-auto max-w-md p-0 bg-surface border-border rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={{ before: today }}
            className="[--cell-size:2.2rem]"
            classNames={{
              selected:
                "bg-plum text-white hover:bg-plum hover:text-white focus:bg-plum focus:text-white rounded-full",
              today: "text-plum font-bold",
            }}
          />
          <div className="border-t sm:border-t-0 sm:border-l border-border p-4 flex flex-col gap-3 w-[240px]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Time</p>
                        <div className="flex flex-wrap gap-1.5 items-start">
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={hourText}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setHourText(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onBlur={handleHourBlur}
                  className="w-9 px-1 py-2 rounded-xl border border-border bg-page/30 text-sm text-center focus:outline-none focus:border-plum"
                />
                <div className="flex flex-col items-center border border-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => stepHour(1)}
                    className="px-1 py-0.5 text-muted hover:text-plum hover:bg-page/50 transition-colors"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepHour(-1)}
                    className="px-1 py-0.5 text-muted hover:text-plum hover:bg-page/50 transition-colors border-t border-border"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <span className="py-2 text-muted">:</span>

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  inputMode="numeric"
                  value={minuteText}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => setMinuteText(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  onBlur={handleMinuteBlur}
                  className="w-9 px-1 py-2 rounded-xl border border-border bg-page/30 text-sm text-center focus:outline-none focus:border-plum"
                />
                <div className="flex flex-col items-center border border-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => stepMinute(1)}
                    className="px-1 py-0.5 text-muted hover:text-plum hover:bg-page/50 transition-colors"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => stepMinute(-1)}
                    className="px-1 py-0.5 text-muted hover:text-plum hover:bg-page/50 transition-colors border-t border-border"
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-center border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={togglePeriod}
                  className="px-1 py-0.5 text-muted hover:text-plum hover:bg-page/50 transition-colors"
                >
                  <ChevronUp size={14} />
                </button>
                <div className="px-2 py-1 text-sm font-bold text-ink border-y border-border w-full text-center bg-page/30">
                  {currentPeriod}
                </div>
                <button
                  type="button"
                  onClick={togglePeriod}
                  className="px-1 py-0.5 text-muted hover:text-plum hover:bg-page/50 transition-colors"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {pastError && <p className="text-[11px] text-red-600 leading-snug">{pastError}</p>}

            <button
              onClick={handleDone}
              className="mt-2 px-4 py-2 bg-plum text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#5a3849] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}