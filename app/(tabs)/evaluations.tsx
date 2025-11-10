import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, Svg } from "react-native-svg";

interface Evaluation {
  curriculum_course_id: number;
  student_grade_id: number | null;
  student_id: string | null;
  grade: string | null;
  remarks: string | null;
  evaluator_name: string | null;
  evaluator_signature: string | null;
  evaluator_signature_data: string | null;
  date_evaluated: string | null;
  code: string;
  title: string;
  year_level: string;
  term: string;
  units: number;
}

interface EvaluationSummary {
  total_courses: number;
  passed_courses: number;
  failed_courses: number;
  in_progress_courses: number;
  pending_courses: number;
  completion_percentage: number;
}

interface EvaluationResponse {
  student: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    academic_year: string;
    program: string;
    evaluation_status: string;
  };
  has_matching_curriculum: boolean;
  curriculum_academic_year: string;
  evaluations: Evaluation[];
  summary: EvaluationSummary;
  error?: string;
}

const Evaluations: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  const loadColor = useThemeColor({}, 'loaderCard');

  const [evaluationData, setEvaluationData] =
    useState<EvaluationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<Evaluation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchEvaluationData = async () => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "User ID not found");
        return;
      }
      const response = await fetch(
        `https://msis.eduisync.io/api/evaluations/get_evaluation.php?user_id=${user.id}`
      );
      const data: EvaluationResponse = await response.json();

      if (data.error) {
        Alert.alert("Error", data.error);
        console.log("error", data.error);
        return;
      }

      setEvaluationData(data);
    } catch (error) {
      console.error("Error fetching evaluation data:", error);
      Alert.alert("Error", "Failed to fetch evaluation data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvaluationData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvaluationData();
  };

  const getStatusFromEvaluation = (evaluation: Evaluation) => {
    if (evaluation.grade !== null && evaluation.grade !== "") {
      if (evaluation.remarks === "Passed") {
        return "passed";
      } else if (evaluation.remarks === "Failed") {
        return "failed";
      } else if (
        evaluation.grade === "INC" ||
        evaluation.grade === "Academic Support"
      ) {
        return "in_progress";
      }
    }
    return "pending";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passed":
        return "bg-green-600";
      case "failed":
        return "bg-red-600";
      case "in_progress":
        return "bg-amber-600";
      case "pending":
      default:
        return "bg-orange-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "passed":
        return "Passed";
      case "failed":
        return "Failed";
      case "in_progress":
        return "In Progress";
      case "pending":
      default:
        return "Pending";
    }
  };

  const formatYearLevel = (yearLevel: string) => {
    if (yearLevel === "fourth_year") {
      return "Fourth Year (Clerkship)";
    }

    return yearLevel
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTerm = (term: string) => {
    if (term === "1st_semestral") return "1st Semestral";
    if (term === "2nd_semestral") return "2nd Semestral";
    return term;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not evaluated yet";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const showEvaluationDetails = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setModalVisible(true);
  };

  // Animated Circular Progress Component
  const CircularProgress = ({ percentage , size = 100, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const animatedValue = new Animated.Value(0);

    // Determine color based on percentage
    const getProgressColor = () => {
      if (percentage < 50) return "#f97316"; // orange
      if (percentage < 75) return "#ea580c"; // darker orange
      return "#16a34a"; // green for 75% and above
    };

    const animateCircle = () => {
      animatedValue.setValue(0);
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    };

    useEffect(() => {
      animateCircle();
    }, [percentage]);

    const strokeDashoffset = animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [
        circumference,
        circumference - (percentage / 100) * circumference,
      ],
    });

    return (
      <View className="items-center justify-center">
        <Svg width={size} height={size} className="transform -rotate-90">
          <Circle
            stroke="#e5e7eb"
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <AnimatedCircle
            stroke={getProgressColor()}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        <View className="absolute items-center justify-center">
          <Text className="text-2xl font-bold text-gray-800" style={{color: textColor }}>
            {percentage}%
          </Text>
          <Text className="text-xs text-gray-500">Complete</Text>
        </View>
      </View>
    );
  };

  // Animated Circle component
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  // Skeleton Loader Component
  const SkeletonLoader = () => {
    return (
      <View className="flex-1 bg-gray-100" style={{ backgroundColor }}>
    

        {/* Summary Section Skeleton */}
        <View className="bg-white p-5 m-3 rounded-lg shadow" style={{ backgroundColor: loadColor}}>
          <View className="h-6 bg-gray-300 rounded w-2/5 mb-6 mx-auto" style={{ backgroundColor: loadColor}}></View>

          <View className="flex-row items-center justify-between mb-6">
            {/* Circular Progress Skeleton */}
            <View className="flex-1 items-center">
              <View className="w-32 h-32 bg-gray-300 rounded-full" style={{ backgroundColor: loadColor}}></View>
            </View>

            {/* Stats Skeleton */}
            <View className="flex-1 pl-4">
              <View className="mb-3">
                <View className="h-7 bg-gray-300 rounded w-12 mb-1" style={{ backgroundColor: loadColor}}></View>
                <View className="h-3 bg-gray-300 rounded w-20" style={{ backgroundColor: loadColor}}></View>
              </View>

              <View className="mb-3">
                <View className="h-7 bg-gray-300 rounded w-12 mb-1" style={{ backgroundColor: loadColor}}></View>
                <View className="h-3 bg-gray-300 rounded w-20" style={{ backgroundColor: loadColor}}></View>
              </View>

              <View>
                <View className="h-7 bg-gray-300 rounded w-12 mb-1" style={{ backgroundColor: loadColor}}></View>
                <View className="h-3 bg-gray-300 rounded w-20" style={{ backgroundColor: loadColor}}></View>
              </View>
            </View>
          </View>

          {/* Additional Stats Skeleton */}
          <View className="flex-row justify-between border-t border-gray-100 pt-4">
            <View className="items-center">
              <View className="h-6 bg-gray-300 rounded w-8 mb-1" style={{ backgroundColor: loadColor}}></View>
              <View className="h-3 bg-gray-300 rounded w-16" style={{ backgroundColor: loadColor}}></View>
            </View>
          </View>
        </View>

        {/* Year Level Skeletons */}
        {[1, 2, 3, 4].map((year) => (
          <View
            key={year}
            className="m-3 bg-white rounded-lg overflow-hidden shadow "
            style={{ backgroundColor}}
          >
            <View className="bg-gray-400 h-12" style={{ backgroundColor: loadColor}}></View>
            <View className="p-4">
              {[1, 2, 3].map((course) => (
                <View
                  key={course}
                  className="bg-gray-50 p-4 rounded mb-3 border-l-4 border-gray-300"
                  style={{ backgroundColor: loadColor}}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <View className="h-5 bg-gray-300 rounded w-16" style={{ backgroundColor: loadColor}}></View>
                    <View className="flex-row items-center" style={{ backgroundColor: loadColor}}>
                      <View className="h-3 bg-gray-300 rounded w-12 mr-2" style={{ backgroundColor: loadColor}}></View>
                      <View className="h-6 bg-gray-300 rounded-full w-16" style={{ backgroundColor: loadColor}}></View>
                    </View>
                  </View>
                  <View className="h-4 bg-gray-300 rounded w-4/5 mb-3" style={{ backgroundColor: loadColor}}></View>
                  <View className="flex-row justify-between">
                    <View className="h-3 bg-gray-300 rounded w-12" style={{ backgroundColor: loadColor}}></View>
                    <View className="h-3 bg-gray-300 rounded w-16" style={{ backgroundColor: loadColor}}></View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return <SkeletonLoader />;
  }

  if (!evaluationData) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-100">
        <Text className="text-gray-600 mb-4">No evaluation data available</Text>
        <TouchableOpacity
          onPress={fetchEvaluationData}
          className="bg-[#be2e2e] px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
     

      <ScrollView
        style={{ flex: 1, backgroundColor }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Section */}
        <View style={{ backgroundColor: cardColor, padding: 20, margin: 12, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: textColor, marginBottom: 16, textAlign: 'center' }}>
            Evaluation Summary
          </Text>

          <View className="flex-row items-center justify-between mb-6">
            {/* Circular Progress */}
            <View className="flex-1 items-center">
              <CircularProgress
                percentage={evaluationData.summary.completion_percentage}
                size={120}
                strokeWidth={10}
              />
            </View>

            {/* Stats */}
            <View className="flex-1 pl-4">
              <View className="mb-3">
                <Text className="text-xl font-bold text-green-600">
                  {evaluationData.summary.passed_courses}
                </Text>
                <Text style={{ fontSize: 12, color: mutedColor }}>Passed Courses</Text>
              </View>

              <View className="mb-3">
                <Text className="text-xl font-bold text-red-600">
                  {evaluationData.summary.failed_courses}
                </Text>
                <Text style={{ fontSize: 12, color: mutedColor }}>Failed Courses</Text>
              </View>

              <View>
                <Text className="text-xl font-bold text-[#be2e2e]">
                  {evaluationData.summary.total_courses}
                </Text>
                <Text style={{ fontSize: 12, color: mutedColor }}>Total Courses</Text>
              </View>
            </View>
          </View>

          {/* Additional Stats */}
          <View className="flex-row justify-between border-t border-gray-100 pt-4">
            <View className="items-center">
              <Text className="text-lg font-bold text-amber-600">
                {evaluationData.summary.in_progress_courses}
              </Text>
              <Text style={{ fontSize: 12, color: mutedColor }}>In Progress</Text>
            </View>

            <View className="items-center">
              <Text className="text-lg font-bold text-orange-500">
                {evaluationData.summary.pending_courses}
              </Text>
              <Text style={{ fontSize: 12, color: mutedColor }}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Evaluations by Year Level - Display all curriculum courses */}
        {["first_year", "second_year", "third_year", "fourth_year"].map(
          (yearLevel) => {
            const yearEvaluations = evaluationData.evaluations.filter(
              (evaluationItem) => evaluationItem.year_level === yearLevel
            );

            // Show year level even if no evaluations to indicate all curriculum years
            return (
              <View
                key={yearLevel}
                className="m-3 bg-white rounded-lg overflow-hidden shadow"
                style={{ backgroundColor: cardColor }}
              >
                <Text className="bg-[#be2e2e] text-white p-4 text-lg font-bold">
                  {formatYearLevel(yearLevel)}
                </Text>

                <View className="p-4">
                  {yearEvaluations.length > 0 ? (
                    yearEvaluations.map((evaluation) => {
                      const status = getStatusFromEvaluation(evaluation);

                      return (
                        <TouchableOpacity
                          key={evaluation.curriculum_course_id}
                          className="bg-gray-50 p-4 rounded mb-3 border-l-4 border-[#be2e2e]"
                          style={{ backgroundColor : cardColor }}
                          onPress={() => showEvaluationDetails(evaluation)}
                        >
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-base font-bold text-gray-800"
                            style={{ color: textColor }}>
                              {evaluation.code}
                            </Text>
                            <View className="flex-row items-center">
                              <Text className="text-xs text-gray-500 mr-2" style={{ color: textColor }}>
                                {formatTerm(evaluation.term)}
                              </Text>
                              <View
                                className={`px-4 py-1 rounded-full ${getStatusColor(status)}`}
                              >
                                <Text className="text-white text-xs font-bold">
                                  {getStatusText(status)}
                                </Text>
                              </View>
                            </View>
                          </View>
                          <Text className="text-sm text-gray-600 mb-3" style={{ color: textColor }}>
                            {evaluation.title}
                          </Text>
                          <View className="flex-row justify-between">
                            {/* Don't show units for fourth year courses */}
                            {evaluation.year_level !== "fourth_year" && (
                              <Text className="text-xs text-gray-500" style={{ color: textColor }}>
                                {evaluation.units} units
                              </Text>
                            )}
                            {evaluation.year_level === "fourth_year" && (
                              <View className="flex-1" />
                            )}
                            {evaluation.grade && (
                              <Text className="text-xs text-gray-500" style={{ color: textColor }}>
                                Grade: {evaluation.grade}
                              </Text>
                            )}
                          </View>
                          {evaluation.remarks && (
                            <Text className="text-xs text-gray-500 mt-2">
                    
                            </Text>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <Text className="text-gray-500 text-center py-4">
                      No courses found for this year level
                    </Text>
                  )}
                </View>
              </View>
            );
          }
        )}

        {evaluationData.evaluations.length === 0 &&
          evaluationData.has_matching_curriculum && (
            <View className="p-5 items-center">
              <Text className="text-gray-600 mb-2">
                No curriculum courses found for your academic year.
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Please contact your academic advisor if this seems incorrect.
              </Text>
            </View>
          )}

        {evaluationData.evaluations.length === 0 &&
          !evaluationData.has_matching_curriculum && (
            <View className="p-5 items-center">
              <Text className="text-gray-600 mb-2">
                No curriculum found for your academic year.
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Please contact your academic advisor to set up your curriculum.
              </Text>
            </View>
          )}
      </ScrollView>

      {/* Evaluation Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-5 w-11/12 max-h-4/5" style={{ backgroundColor: cardColor }}>
            {selectedEvaluation && (
              <>
                <Text className="text-xl font-bold text-gray-800 mb-4" style={{ color: textColor }}>
                  {selectedEvaluation.code} - {selectedEvaluation.title}
                </Text>

                <View className="mb-4">
                  <Text className="text-sm text-gray-500">Year Level</Text>
                  <Text className="text-base text-gray-800" style={{ color: textColor }}>
                    {formatYearLevel(selectedEvaluation.year_level)}
                  </Text>
                </View>

                <View className="mb-4">
                  <Text className="text-sm text-gray-500">Term</Text>
                  <Text className="text-base text-gray-800" style={{ color: textColor }}> 
                    {formatTerm(selectedEvaluation.term)}
                  </Text>
                </View>

                {/* Don't show units for fourth year courses in modal either */}
                {selectedEvaluation.year_level !== "fourth_year" && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500">Units</Text>
                    <Text className="text-base text-gray-800" style={{ color: textColor }}>
                      {selectedEvaluation.units}
                    </Text>
                  </View>
                )}

                {selectedEvaluation.grade && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500">Grade</Text>
                    <Text className="text-base text-gray-800" style={{ color: textColor }}>
                      {selectedEvaluation.grade}
                    </Text>
                  </View>
                )}

                {selectedEvaluation.remarks && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500">Remarks</Text>
                    <Text className="text-base text-gray-800" style={{ color: textColor }}>
                      {selectedEvaluation.remarks}
                    </Text>
                  </View>
                )}

                {selectedEvaluation.evaluator_name && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500">Evaluated by</Text>
                    <Text className="text-base text-gray-800" style={{ color: textColor }}>
                      {selectedEvaluation.evaluator_name}
                    </Text>
                  </View>
                )}

                {selectedEvaluation.date_evaluated && (
                  <View className="mb-4">
                    <Text className="text-sm text-gray-500">
                      Date Evaluated
                    </Text>
                    <Text className="text-base text-gray-800" style={{ color: textColor }}>
                      {formatDate(selectedEvaluation.date_evaluated)}
                    </Text>
                  </View>
                )}

                {selectedEvaluation.evaluator_signature_data && (
                  <View className="mb-4 items-center">
                    <Text className="text-sm text-gray-500 mb-2">
                      Evaluator Signature
                    </Text>
                    <Image
                      source={{
                        uri: selectedEvaluation.evaluator_signature_data,
                      }}
                      className="w-32 h-32 border border-gray-300 rounded"
                      resizeMode="contain"
                    />
                  </View>
                )}

                <TouchableOpacity
                  className="bg-[#be2e2e] p-3 rounded mt-4"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-white text-center">Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Evaluations;
