"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TimeSchedule() {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [weekData, setWeekData] = useState([
    {
      day: 14,
      month: "April",
      dayOfWeek: "Monday",
      workHours: 9,
      restHours: 15,
      ncHours: 0,
      slots: [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      day: 15,
      month: "April",
      dayOfWeek: "Tuesday",
      workHours: 10,
      restHours: 14,
      ncHours: 0,
      slots: [
        0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0,
      ],
    },
    {
      day: 16,
      month: "April",
      dayOfWeek: "Wednesday",
      workHours: 10,
      restHours: 12,
      ncHours: 2,
      slots: [
        0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0,
      ],
    },
  ]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  // Time slots (0-23)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  // Calculate hours based on slots
  const calculateHours = (slots: number[]) => {
    const workHours = slots.filter((slot) => slot === 1).length;
    const ncHours = slots.filter((slot) => slot === 2).length;
    const restHours = slots.filter((slot) => slot === 0).length;
    return { workHours, restHours, ncHours };
  };

  // Update slots and recalculate hours
  const updateDaySlots = (dayIndex: number, newSlots: number[]) => {
    const updatedWeekData = [...weekData];
    updatedWeekData[dayIndex].slots = newSlots;

    const { workHours, restHours, ncHours } = calculateHours(newSlots);
    updatedWeekData[dayIndex].workHours = workHours;
    updatedWeekData[dayIndex].restHours = restHours;
    updatedWeekData[dayIndex].ncHours = ncHours;

    setWeekData(updatedWeekData);
  };

  // Apply selected slot type to all selected slots
  const applySlotTypeToSelection = (slotType: number) => {
    if (expandedDay === null || selectedSlots.length === 0) return;

    const dayIndex = weekData.findIndex((day) => day.day === expandedDay);
    if (dayIndex === -1) return;

    const newSlots = [...weekData[dayIndex].slots];
    selectedSlots.forEach((slotIndex) => {
      newSlots[slotIndex] = slotType;
    });

    updateDaySlots(dayIndex, newSlots);
    setSelectedSlots([]);
  };

  // Handle slot selection
  const handleSlotClick = (slotIndex: number, isMouseDown = false) => {
    if (expandedDay === null) return;

    if (isMouseDown) {
      setIsSelecting(true);
      if (isShiftPressed && selectedSlots.length > 0) {
        // Add to selection when shift is pressed
        if (selectedSlots.includes(slotIndex)) {
          // If already selected, deselect it
          setSelectedSlots(selectedSlots.filter((slot) => slot !== slotIndex));
        } else {
          // Add to multi-selection
          setSelectedSlots([...selectedSlots, slotIndex]);
        }
      } else {
        // Start new selection
        setSelectedSlots([slotIndex]);
      }
    } else if (isSelecting) {
      if (!selectedSlots.includes(slotIndex)) {
        setSelectedSlots([...selectedSlots, slotIndex]);
      }
    }
  };

  // Handle mouse up to end selection
  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
    }
  };

  // Handle day expansion
  const toggleDayExpansion = (day: number) => {
    if (expandedDay === day) {
      setExpandedDay(null);
      setSelectedSlots([]);
    } else {
      setExpandedDay(day);
      setSelectedSlots([]);
    }
  };

  // Track shift key status
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp();
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isSelecting, selectedSlots]);

  // Grid for hours at the top
  const HoursGrid = () => (
    <div className="flex gap-1">
      {timeSlots.map((hour) => (
        <div key={hour} className="w-6 text-center text-xs text-gray-500">
          {hour}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6">Schedule</h1>

      <div className="space-y-4">
        {weekData.map((day, dayIndex) => (
          <div key={dayIndex} className="border rounded-lg overflow-hidden">
            <div className="flex items-center p-4 bg-white">
              <div className="w-32">
                <div className="font-medium">
                  {day.month} {day.day}
                </div>
                <div className="text-sm text-gray-500">{day.dayOfWeek}</div>
              </div>

              <div className="flex-1">
                <div className="mb-2">
                  <HoursGrid />
                </div>
                <div className="flex gap-1">
                  {day.slots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className={cn(
                        "w-6 h-6 rounded-full",
                        slot === 0
                          ? "border bg-white"
                          : slot === 1
                          ? "bg-green-400"
                          : "bg-orange-300"
                      )}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 ml-4">
                <div className="text-sm">
                  <span className="font-medium">Work:</span> {day.workHours}h
                </div>
                <div className="text-sm">
                  <span className="font-medium">Rest:</span> {day.restHours}h
                </div>
                <div className="text-sm">
                  <span className="font-medium">NC:</span> {day.ncHours}h
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                  onClick={() => toggleDayExpansion(day.day)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Expanded edit view */}
            {expandedDay === day.day && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <h3 className="font-medium">
                      Edit: {day.month} {day.day}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Apply:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-8 gap-1")}
                        onClick={() => {
                          applySlotTypeToSelection(1);
                        }}
                      >
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        Work
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-8 gap-1")}
                        onClick={() => {
                          applySlotTypeToSelection(0);
                        }}
                      >
                        <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                        Rest
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn("h-8 gap-1")}
                        onClick={() => {
                          applySlotTypeToSelection(2);
                        }}
                      >
                        <div className="w-3 h-3 rounded-full bg-orange-300"></div>
                        NC
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="bg-gray-200 px-2 py-0.5 rounded">
                        Shift
                      </span>
                      <span className="ml-1">+ Click for multi-select</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setSelectedSlots([]);
                      }}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>

                <div className="ml-12">
                  <div className="flex gap-1 items-center mb-2">
                    <div className="w-12 text-xs text-gray-500 mr-1">Hour</div>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot}
                        className="w-6 text-center text-xs text-gray-500"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 text-xs text-gray-500 mr-1">
                      Status
                    </div>
                    <div className="flex gap-1">
                      {day.slots.map((slotValue, slotIndex) => (
                        <div
                          key={slotIndex}
                          className={cn(
                            "w-6 h-6 rounded-full cursor-pointer transition-all duration-150",
                            slotValue === 0
                              ? "border bg-white"
                              : slotValue === 1
                              ? "bg-green-400"
                              : "bg-orange-300",
                            selectedSlots.includes(slotIndex)
                              ? "ring-2 ring-blue-500 ring-offset-1"
                              : ""
                          )}
                          onMouseDown={() => handleSlotClick(slotIndex, true)}
                          onMouseOver={() => handleSlotClick(slotIndex)}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <div className="mr-6">
                    <span className="font-medium">Work hours:</span>{" "}
                    {day.workHours}
                  </div>
                  <div className="mr-6">
                    <span className="font-medium">Rest hours:</span>{" "}
                    {day.restHours}
                  </div>
                  <div>
                    <span className="font-medium">NC hours:</span> {day.ncHours}
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => toggleDayExpansion(day.day)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    onClick={() => toggleDayExpansion(day.day)}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
