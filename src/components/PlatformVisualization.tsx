import React from 'react';
import { Train, Coach, PlatformMarker } from '../types';

interface PlatformVisualizationProps {
  train: Train;
  selectedCoach: Coach;
  groupMembers?: Array<{ coachNumber: string; userName: string }>;
}

const PlatformVisualization: React.FC<PlatformVisualizationProps> = ({
  train,
  selectedCoach,
  groupMembers = []
}) => {
  // Platform dimensions (scaled)
  const platformLength = 800;
  const platformHeight = 200;
  const coachHeight = 60;
  const platformY = (platformHeight - coachHeight) / 2;

  // Calculate scale factor
  const maxPosition = Math.max(...train.coaches.map(c => c.platformPosition));
  const scaleFactor = (platformLength - 100) / (maxPosition || 1);

  // Platform markers (example positions)
  const markers: PlatformMarker[] = [
    { type: 'entrance', position: 0, label: 'Entrance' },
    { type: 'stairs', position: maxPosition * 0.3, label: 'Stairs' },
    { type: 'lift', position: maxPosition * 0.5, label: 'Lift' },
    { type: 'foodStall', position: maxPosition * 0.7, label: 'Food' },
    { type: 'exit', position: maxPosition, label: 'Exit' }
  ];

  const getCoachColor = (coach: Coach) => {
    if (coach.coachNumber === selectedCoach.coachNumber) {
      return '#3b82f6'; // Primary blue for selected
    }
    if (groupMembers.some(m => m.coachNumber === coach.coachNumber)) {
      return '#10b981'; // Green for group members
    }
    switch (coach.coachType) {
      case 'ac':
      case 'firstClass':
        return '#60a5fa';
      case 'sleeper':
        return '#34d399';
      case 'general':
        return '#9ca3af';
      default:
        return '#9ca3af';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'entrance':
      case 'exit':
        return '🚪';
      case 'stairs':
        return '🪜';
      case 'lift':
        return '🛗';
      case 'foodStall':
        return '🍔';
      default:
        return '📍';
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={platformLength}
        height={platformHeight + 80}
        viewBox={`0 0 ${platformLength} ${platformHeight + 80}`}
        className="mx-auto"
      >
        {/* Platform base */}
        <rect
          x="0"
          y={platformY + coachHeight}
          width={platformLength}
          height="10"
          fill="#d1d5db"
        />

        {/* Platform markers */}
        {markers.map((marker, index) => {
          const x = 50 + marker.position * scaleFactor;
          return (
            <g key={index}>
              <line
                x1={x}
                y1={platformY + coachHeight + 10}
                x2={x}
                y2={platformY + coachHeight + 30}
                stroke="#6b7280"
                strokeWidth="2"
                strokeDasharray="4"
              />
              <text
                x={x}
                y={platformY + coachHeight + 45}
                textAnchor="middle"
                fontSize="10"
                fill="#374151"
              >
                {getMarkerIcon(marker.type)} {marker.label}
              </text>
            </g>
          );
        })}

        {/* Train coaches */}
        {train.coaches.map((coach) => {
          const x = 50 + coach.platformPosition * scaleFactor;
          const coachWidth = 70;
          const isSelected = coach.coachNumber === selectedCoach.coachNumber;
          const hasGroupMember = groupMembers.find(m => m.coachNumber === coach.coachNumber);

          return (
            <g key={coach.coachNumber}>
              {/* Coach rectangle */}
              <rect
                x={x}
                y={platformY}
                width={coachWidth}
                height={coachHeight}
                fill={getCoachColor(coach)}
                stroke={isSelected ? '#1e40af' : '#374151'}
                strokeWidth={isSelected ? '3' : '1'}
                rx="5"
              />

              {/* Coach number */}
              <text
                x={x + coachWidth / 2}
                y={platformY + coachHeight / 2}
                textAnchor="middle"
                fontSize="14"
                fontWeight="bold"
                fill="white"
              >
                {coach.coachNumber}
              </text>

              {/* Selected indicator */}
              {isSelected && (
                <>
                  <polygon
                    points={`${x + coachWidth / 2},${platformY - 10} ${x + coachWidth / 2 - 8},${platformY} ${x + coachWidth / 2 + 8},${platformY}`}
                    fill="#1e40af"
                  />
                  <text
                    x={x + coachWidth / 2}
                    y={platformY - 15}
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="#1e40af"
                  >
                    You
                  </text>
                </>
              )}

              {/* Group member indicator */}
              {hasGroupMember && !isSelected && (
                <text
                  x={x + coachWidth / 2}
                  y={platformY - 10}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#10b981"
                >
                  👥 {hasGroupMember.userName}
                </text>
              )}

              {/* Distance from entrance */}
              {isSelected && (
                <text
                  x={x + coachWidth / 2}
                  y={platformY + coachHeight + 70}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#3b82f6"
                  fontWeight="bold"
                >
                  {Math.round(coach.platformPosition)}m from entrance
                </text>
              )}
            </g>
          );
        })}

        {/* Engine */}
        <g>
          <rect
            x="10"
            y={platformY}
            width="30"
            height={coachHeight}
            fill="#ef4444"
            stroke="#374151"
            rx="5"
          />
          <text
            x="25"
            y={platformY + coachHeight / 2 + 5}
            textAnchor="middle"
            fontSize="20"
            fill="white"
          >
            🚂
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary-600 rounded"></div>
          <span>Your Coach</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Group Members</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-400 rounded"></div>
          <span>AC/1st Class</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>Sleeper</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>General</span>
        </div>
      </div>
    </div>
  );
};

export default PlatformVisualization;
